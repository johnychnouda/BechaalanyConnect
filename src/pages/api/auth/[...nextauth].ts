// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend NextAuth types
declare module "next-auth" {
    interface Session {
        laravelToken?: string;
        laravelUser?: any;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
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
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Missing credentials');
                }

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        const { token, user } = data;
                        
                        if (!token || !user) {
                            throw new Error('Invalid response structure');
                        }
                        
                        return {
                            id: user.id.toString(),
                            email: user.email,
                            name: user.name || user.username,
                            role: user.role,
                            laravelToken: token,
                            laravelUser: user,
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
        async jwt({ token, user, account }) {
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
                        token.laravelUser = laravelUser;
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

            return token;
        },
        async session({ session, token }) {
            // Pass Laravel data to session
            session.laravelToken = token.laravelToken;
            session.laravelUser = token.laravelUser;
            
            // Ensure user data is properly structured
            if (token.laravelUser) {
                session.user = {
                    id: token.laravelUser.id.toString(),
                    email: token.laravelUser.email,
                    name: token.laravelUser.name || token.laravelUser.username,
                    role: token.laravelUser.role,
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
    secret: process.env.NEXTAUTH_SECRET,
});
