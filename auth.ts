
import NextAuth from "next-auth"
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Twitter from "next-auth/providers/twitter";
import Credentials from "next-auth/providers/credentials";
import prisma  from '@/lib/prisma';
import bcryptjs from "bcryptjs";
import { authConfig } from './auth.config';


declare module "next-auth" {
  interface User {
    isadmin?: boolean;
    first_name?: string;
    last_name?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      image?: string | null;
      isadmin?: boolean;
    };
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  //adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
    GitHub,
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in database
         const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists
        if (!user) {
          return null;
        }

        // Check if user signed up with a different provider (OAuth)
        if (user.provider && user.provider !== 'credentials') {
          throw new Error(`This email is registered with ${user.provider}. Please sign in using ${user.provider}.`);
        }

        // Check if the password matches
        if (
          user &&
          typeof user.password === 'string' &&
          typeof credentials.password === 'string'
        ) {
          const isMatch = await bcryptjs.compare(credentials.password as string, user.password);
          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              isadmin: user.isadmin,
            };
          }
        }
        // If user does not exist or password does not match return null
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Only check for OAuth providers (skip credentials provider)
      if (account?.provider && account.provider !== 'credentials') {
        // Check if user already exists with credentials provider
        const existingUser = await prisma.user.findFirst({
          where: {
            email: user.email as string,
          },
        });

        if (existingUser) {
          // If user exists and signed up with credentials, prevent OAuth sign-in
          if (existingUser.provider === 'credentials') {
            // Return a redirect URL with error details
            throw new Error(`This email is already registered with credentials. Please sign in using your email and password instead.`);
          }
          // If user exists with same OAuth provider or no provider set, allow sign-in
          // Update provider if not set
          if (!existingUser.provider) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { provider: account.provider },
            });
          }
        } else {
          // New OAuth user - create with provider
          await prisma.user.create({
            data: {
              email: user.email as string,
              name: user.name || 'NO_NAME',
              first_name: profile?.given_name || 'NO_NAME',
              last_name: profile?.family_name || 'NO_NAME',
              image: user.image,
              provider: account.provider,
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // Assign user fields to token
      if (user) {
        token.id = user.id;
        token.isadmin = user.isadmin;
        token.name = user.name;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
      }

      return token;
    },
    async session({ session, token }) {
      // Set the user ID from the token
      session.user.id = token.sub ?? '';
      session.user.isadmin = typeof token.isadmin === 'boolean' ? token.isadmin : undefined;
      session.user.name = token.name ?? undefined;
      session.user.first_name = typeof token.first_name === 'string' ? token.first_name : undefined;
      session.user.last_name = typeof token.last_name === 'string' ? token.last_name : undefined;
      session.user.image = token.picture ?? null;

      return session;
    },

  },
});
