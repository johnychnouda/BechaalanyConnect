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
            country?: string;
            phone_number?: string;
            is_business_user?: boolean;
            business_name?: string;
            business_location?: string;
            user_types_id?: number;
            credits_balance?: number;
            total_purchases?: number;
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
                        
                        // Debug: Log the user data from Laravel
                        // console.log('Laravel user data:', JSON.stringify(user, null, 2));
                        
                        return {
                            id: user.id.toString(),
                            email: user.email,
                            name: user.name || user.username,
                            role: user.role,
                            country: user.country,
                            phone_number: user.phone_number,
                            is_business_user: user.is_business_user,
                            business_name: user.business_name,
                            business_location: user.business_location,
                            user_types_id: user.user_types_id,
                            credits_balance: user.credits_balance || 0,
                            total_purchases: user.total_purchases || 0,
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
        async jwt({ token, user, account, trigger }) {
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

            // Handle session refresh trigger
            if (trigger === "update" && token.laravelToken) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token.laravelToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const freshUserData = await response.json();
                        token.laravelUser = {
                            ...token.laravelUser,
                            ...freshUserData,
                        };
                    }
                } catch (error) {
                    console.error('Error refreshing user data:', error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            // Pass Laravel data to session
            session.laravelToken = token.laravelToken;
            session.laravelUser = token.laravelUser;
            
            // Debug: Log the token data
            // console.log('Token laravelUser data:', JSON.stringify(token.laravelUser, null, 2));
            
            // Ensure user data is properly structured
            if (token.laravelUser) {
                session.user = {
                    id: token.laravelUser.id.toString(),
                    email: token.laravelUser.email,
                    name: token.laravelUser.name || token.laravelUser.username,
                    role: token.laravelUser.role,
                    country: token.laravelUser.country,
                    phone_number: token.laravelUser.phone_number,
                    is_business_user: token.laravelUser.is_business_user,
                    business_name: token.laravelUser.business_name,
                    business_location: token.laravelUser.business_location,
                    user_types_id: token.laravelUser.user_types_id,
                    credits_balance: token.laravelUser.credits_balance || 0,
                    total_purchases: token.laravelUser.total_purchases || 0,
                };
            }
            
            // Debug: Log the final session user data
            // console.log('Final session user data:', JSON.stringify(session.user, null, 2));
            
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
