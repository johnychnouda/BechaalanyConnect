// pages/api/auth/[...nextauth].ts
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";


// Extend NextAuth types
declare module "next-auth" {
    interface Session {
        laravelToken?: string;
        laravelUser?: Record<string, unknown>;
        // Slim identity only. Volatile fields (credits_balance, totals, business_*, user_types,
        // orders) live in AuthContext, fetched from /user/profile — never in the session cookie.
        user: {
            id?: string;
            email?: string;
            name?: string;
            role?: string;
            user_types_id?: number;
            verification_status?: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        laravelToken?: string;
        laravelUser?: Record<string, unknown>;
    }
}


/**
 * Logins are made from this server, so Laravel would see this server's IP for every
 * customer and they would all share one rate limit. These headers carry the real client IP;
 * Laravel believes it only with the shared secret (App\Support\ClientIp). The secret has
 * no NEXT_PUBLIC_ prefix on purpose: it must never reach the browser. Unset, nothing is sent.
 */
const proxyHeaders = (request: NextApiRequest): Record<string, string> => {
    const secret = process.env.INTERNAL_PROXY_SECRET;
    if (!secret) return {};

    const forwarded = request.headers['x-vercel-forwarded-for'] || request.headers['x-forwarded-for'];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const clientIp = first?.split(',')[0]?.trim() || request.socket?.remoteAddress;

    return clientIp
        ? { 'X-Internal-Proxy-Secret': secret, 'X-Proxied-Client-Ip': clientIp }
        : {};
};

const buildOptions = (request: NextApiRequest): NextAuthOptions => ({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                lang: { label: "Language", type: "text" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Missing credentials');
                }

                try {
                    // Get language from credentials or fallback to Accept-Language header or default to 'en'
                    const lang = credentials.lang || req?.headers?.['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
                    
                    // Use locale-aware login endpoint
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${lang}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': lang,
                            ...proxyHeaders(request),
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                            lang: lang,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        const { token, user } = data;

                        if (!token || !user) {
                            throw new Error('Invalid response structure');
                        }

                        // Store ONLY identity + routing data in the JWT cookie. Volatile/large
                        // fields (credits_balance, total_purchases, received_amount, business_*,
                        // user_types object, orders) are fetched live from /user/profile in
                        // AuthContext — keeping them out of the cookie prevents it from growing
                        // past Vercel's header limit (494 REQUEST_HEADER_TOO_LARGE).
                        const identityData = {
                            id: user.id.toString(),
                            email: user.email,
                            name: user.name || user.username,
                            role: user.role,
                            user_types_id: user.user_types_id,
                            verification_status: user.verification_status,
                        };

                        return {
                            ...identityData,
                            laravelToken: token,
                            laravelUser: identityData,
                        };
                    } else {
                        // Try to extract error message from Laravel
                        const errorData = await response.json().catch(() => ({}));
                        const message = errorData?.message || 'Login failed. Please try again.';
                        throw new Error(message);
                    }
                } catch (error) {
                    // Always throw to propagate error to NextAuth
                    if (error instanceof Error) {
                        throw new Error(error.message || 'Login failed. Please try again.');
                    } else {
                        throw new Error('Login failed. Please try again.');
                    }
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            // Handle Google OAuth
            if (account?.provider === "google" && user) {
                // Send the signed Google ID token, NOT the profile fields.
                //
                // This used to post { email, username, google_id } as plain values,
                // and the backend minted a Sanctum token for whichever account
                // matched. Since /auth/google-sync is a public endpoint, anyone could
                // post a victim's email address and be handed a working token for
                // that account. The backend now verifies this token's signature,
                // issuer, audience and expiry against Google's published keys and
                // reads the identity out of the verified claims.
                if (!account.id_token) {
                    throw new Error('GoogleSignInFailed');
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...proxyHeaders(request),
                    },
                    body: JSON.stringify({ id_token: account.id_token }),
                });

                if (!response.ok) {
                    // Previously this failure was only console.error'd and the flow
                    // continued, producing a session with no laravelToken: the user
                    // appeared signed in while every API call went out unauthenticated,
                    // so the site looked broken with no explanation. Throwing sends
                    // them to pages.error instead.
                    throw new Error('GoogleSignInFailed');
                }

                const { token: laravelToken, user: laravelUser } = await response.json();
                token.laravelToken = laravelToken;
                // Identity only — same slim shape as the credentials path.
                token.laravelUser = {
                    id: laravelUser.id.toString(),
                    email: laravelUser.email,
                    name: laravelUser.name || laravelUser.username,
                    role: laravelUser.role,
                    user_types_id: laravelUser.user_types_id,
                    verification_status: laravelUser.verification_status,
                };
            }

            // Handle credentials login
            if (account?.provider === "credentials" && user) {
                token.laravelToken = (user as { laravelToken?: string }).laravelToken;
                token.laravelUser = (user as { laravelUser?: Record<string, unknown> }).laravelUser;
            }

  

            // Handle session refresh trigger. Only verification_status is allowed back into the
            // cookie — it gates the middleware (e.g. a mid-session KYC approval must unlock the
            // dashboard). Financial data is NEVER written to the token; AuthContext reads it live
            // from /user/profile so the cookie stays small.
            if (trigger === "update" && session?.verification_status && token.laravelUser) {
                token.laravelUser = {
                    ...token.laravelUser,
                    verification_status: session.verification_status,
                };
            }

            return token;
        },
        async session({ session, token }) {
            // Pass Laravel token + slim identity to the session. Financial/business/user_types
            // data is intentionally NOT here — AuthContext merges it in live from /user/profile.
            session.laravelToken = token.laravelToken;
            session.laravelUser = token.laravelUser;

            if (token.laravelUser) {
                const lu = token.laravelUser as { id?: string | number; email?: string; name?: string; role?: string; user_types_id?: number; verification_status?: 'unsubmitted' | 'pending' | 'approved' | 'rejected' };
                session.user = {
                    id: lu.id?.toString(),
                    email: lu.email,
                    name: lu.name,
                    role: lu.role,
                    user_types_id: lu.user_types_id,
                    verification_status: lu.verification_status,
                };
            }

            return session;
        }
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days - same as session
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
});

export default function auth(req: NextApiRequest, res: NextApiResponse) {
    return NextAuth(req, res, buildOptions(req));
}
