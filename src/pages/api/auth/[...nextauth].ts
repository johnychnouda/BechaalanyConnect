// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";


interface UserSalesType {
    id: number;
    title: string;
    slug: string;
}

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
            received_amount?: number;
            user_types?: UserSalesType;
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
                        
                        // Only store essential user data in JWT to prevent token size issues
                        const essentialUserData = {
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
                            received_amount: user.received_amount || 0,
                            user_types: user.user_types,
                        };
                        
                        return {
                            ...essentialUserData,
                            laravelToken: token,
                            laravelUser: essentialUserData, // Store minimal user data
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
                        // Store only essential user data
                        token.laravelUser = {
                            id: laravelUser.id.toString(),
                            email: laravelUser.email,
                            name: laravelUser.name || laravelUser.username,
                            role: laravelUser.role,
                            country: laravelUser.country,
                            phone_number: laravelUser.phone_number,
                            is_business_user: laravelUser.is_business_user,
                            business_name: laravelUser.business_name,
                            business_location: laravelUser.business_location,
                            user_types_id: laravelUser.user_types_id,
                            credits_balance: laravelUser.credits_balance || 0,
                            total_purchases: laravelUser.total_purchases || 0,
                            received_amount: laravelUser.received_amount || 0,
                            user_types: laravelUser.user_types,
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

  

             // Handle session refresh trigger - only update essential data
             if (trigger === "update" && token.laravelToken) {
                try {
                    // Get the locale from the token or fallback to 'en'
                    const locale = token.laravelUser?.locale || 'en';
                    
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${locale}/user/profile`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token.laravelToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const freshUserData = await response.json();
                        // Only update essential fields to prevent token bloat
                        token.laravelUser = {
                            ...token.laravelUser,
                            credits_balance: freshUserData.credits_balance || token.laravelUser?.credits_balance,
                            total_purchases: freshUserData.total_purchases || token.laravelUser?.total_purchases,
                            received_amount: freshUserData.received_amount || token.laravelUser?.received_amount,
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
                    received_amount: token.laravelUser.received_amount || 0,
                    user_types: token.laravelUser.user_types,
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
