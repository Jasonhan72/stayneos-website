// NextAuth configuration for Cloudflare D1
// Replaces Prisma adapter with D1 direct queries

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { userDb, getDb } from "@/lib/d1";

// NextAuth handler using D1 database
const handler = async (request: Request) => {
  const db = getDb();

  return NextAuth({
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "邮箱", type: "email" },
          password: { label: "密码", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await userDb.findByEmail(db, credentials.email);

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar,
            role: user.role,
          };
        },
      }),
    ],
    pages: {
      signIn: "/login",
      error: "/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        return session;
      },
    },
    session: {
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60, // 7天
    },
    secret: process.env.NEXTAUTH_SECRET,
  })(request);
};

export { handler as GET, handler as POST };
