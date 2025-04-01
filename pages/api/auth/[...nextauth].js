import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { PrismaClient as PrismaUserClient } from '../../../prisma/sqlite/generated/user';

const prisma = new PrismaUserClient();

export default NextAuth({
  // baseUrl: process.env.NEXTAUTH_URL,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
      if (user?.id) token.id = user.id;
      if (user?.role) token.role = user.role;
      if (user?.permissions) token.permissions = user.permissions;
      if (user?.provider) token.provider = user.provider;
      return token;
      }catch (error) {
        console.error("JWT Callback Error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try{
      if (token?.id) session.user.id = token.id;
      if (token?.role) session.user.role = token.role;
      if (token?.permissions) session.user.permissions = token.permissions;
      if (token?.provider) session.user.provider = token.provider;
      return session;
      } catch (error) {
        console.error("Session Callback Error:", error);
        return session;
      }
    },
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
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
          throw new Error('Invalid email or password');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions?.split(',') || [],
          provider: 'credentials',
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  secret: process.env.JWT_AUTH,
});
