import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const bootstrapEmail = process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL?.toLowerCase();
const isLocalBootstrapEnabled = process.env.NODE_ENV !== "production" && Boolean(bootstrapEmail);
const adminAlias = "admin";
const adminEmail = "admin@keryx.local";

function normalizeCredentialIdentifier(rawCredential: string) {
  const normalized = rawCredential.trim().toLowerCase();
  if (!normalized) return normalized;
  if (normalized === adminAlias) return adminEmail;
  return normalized;
}

async function ensureDefaultOrgMembership(userId: string) {
  let org = await prisma.organization.findFirst({
    where: { users: { some: { userId } } },
    select: { id: true },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Workspace Inicial" },
      select: { id: true },
    });
    await prisma.organizationUser.create({
      data: { userId, organizationId: org.id, role: "OWNER" },
    });
  }
}

export const authOptions: NextAuthOptions = {
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
        email: { label: "Usuario o email corporativo", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = normalizeCredentialIdentifier(credentials.email);
        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (!user && isLocalBootstrapEnabled && normalizedEmail === bootstrapEmail) {
          const hashedPassword = await bcrypt.hash(credentials.password, 12);
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: "Admin Inicial",
              role: "ADMIN",
              hashedPassword,
            },
          });
          await ensureDefaultOrgMembership(user.id);
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        if (!user) {
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            const hashedPassword = await bcrypt.hash(credentials.password, 12);
            const newUser = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name: "Admin Inicial",
                role: "ADMIN",
                hashedPassword,
              }
            });
            const org = await prisma.organization.create({ data: { name: "Workspace Inicial" } });
            await prisma.organizationUser.create({ data: { userId: newUser.id, organizationId: org.id, role: "OWNER" } });
            return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
          }
          return null;
        }

        if (!user.hashedPassword) {
          if (isLocalBootstrapEnabled && normalizedEmail === bootstrapEmail) {
            const hashedPassword = await bcrypt.hash(credentials.password, 12);
            user = await prisma.user.update({
              where: { id: user.id },
              data: { hashedPassword },
            });
            await ensureDefaultOrgMembership(user.id);
            return { id: user.id, email: user.email, name: user.name, role: user.role };
          }
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isPasswordValid) {
          if (isLocalBootstrapEnabled && normalizedEmail === bootstrapEmail) {
            const hashedPassword = await bcrypt.hash(credentials.password, 12);
            user = await prisma.user.update({
              where: { id: user.id },
              data: { hashedPassword },
            });
            await ensureDefaultOrgMembership(user.id);
            return { id: user.id, email: user.email, name: user.name, role: user.role };
          }
          return null;
        }

        await ensureDefaultOrgMembership(user.id);
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
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role = token.role as string;
      }
      return session;
    }
  }
};
