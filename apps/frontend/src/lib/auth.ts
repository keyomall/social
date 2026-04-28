import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string || "placeholder",
      clientSecret: process.env.GITHUB_SECRET as string || "placeholder",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string || "placeholder",
    }),
    CredentialsProvider({
      name: "Enterprise Auth",
      credentials: {
        email: { label: "Email corporativo", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // @ts-ignore
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) {
          // @ts-ignore
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            const hashedPassword = await bcrypt.hash(credentials.password, 12);
            // @ts-ignore
            const newUser = await prisma.user.create({
              data: {
                email: credentials.email,
                name: "Admin Inicial",
                role: "ADMIN",
              }
            });
            // @ts-ignore
            const org = await prisma.organization.create({ data: { name: "Workspace Inicial" } });
            // @ts-ignore
            await prisma.organizationUser.create({ data: { userId: newUser.id, organizationId: org.id, role: "OWNER" } });
            return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
          }
          return null; 
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    }
  }
};
