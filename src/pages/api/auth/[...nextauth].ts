// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";


// Extend NextAuth types
declare module "next-auth" {
    interface Session {
        laravelToken?: string;
        laravelUser?: any;
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
        laravelUser?: any;
    }
}


export default NextAuth({
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
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: user.email,
                            username: user.name,
                            google_id: user.id,
                        }),
                    });

                    if (response.ok) {
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
                } catch (error) {
                    console.error('Error syncing user with Laravel:', error);
                }
            }

            // Handle credentials login
            if (account?.provider === "credentials" && user) {
                token.laravelToken = (user as any).laravelToken;
                token.laravelUser = (user as any).laravelUser;
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
                session.user = {
                    id: token.laravelUser.id?.toString(),
                    email: token.laravelUser.email,
                    name: token.laravelUser.name,
                    role: token.laravelUser.role,
                    user_types_id: token.laravelUser.user_types_id,
                    verification_status: token.laravelUser.verification_status,
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
