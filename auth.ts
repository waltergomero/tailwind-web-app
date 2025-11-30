
import NextAuth from "next-auth"
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
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
  providers: [Google, GitHub,
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

        // Check if user exists and if the password matches
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
