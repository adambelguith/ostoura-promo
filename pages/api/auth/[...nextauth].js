import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { PrismaClient as PrismaUserClient } from '../../../prisma/sqlite/generated/user';

const prisma = new PrismaUserClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              username: true,
              email: true,
              password: true,
              role: true,
              permissions: true,
            },
          });

          if (!user) {
            return null; // Return null instead of throwing error
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            return null; // Return null instead of throwing error
          }

          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role,
            permissions: user.permissions?.split(',') || [],
            provider: 'credentials'
          };
        } catch (error) {
          return null; // Return null for any errors
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          provider: 'google',
          role: 'user',
          permissions: 'view_products,add_to_cart'
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.provider = user.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
