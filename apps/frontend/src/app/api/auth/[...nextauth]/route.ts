import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Se omite prerenderizado para API routes con base de datos real
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
