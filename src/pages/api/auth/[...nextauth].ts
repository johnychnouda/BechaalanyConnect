// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extend NextAuth types
declare module "next-auth" {
    interface Session {
        laravelToken?: string;
        laravelUser?: any;
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
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // This runs when user signs in with Google
            if (account?.provider === "google" && user) {
                try {
                    // Call your Laravel API to create/update user
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
                        // Store Laravel token and user data in NextAuth token
                        token.laravelToken = laravelToken;
                        token.laravelUser = laravelUser;
                    } else {
                        console.error('Failed to sync user with Laravel:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error syncing user with Laravel:', error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Pass Laravel data to session so it's available in components
            session.laravelToken = token.laravelToken;
            session.laravelUser = token.laravelUser;
            return session;
        },
    },
});
