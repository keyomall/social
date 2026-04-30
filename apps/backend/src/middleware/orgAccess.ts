import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export function requireOrgAccess(requiredRoles?: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const orgFromHeader = req.header("x-organization-id");
    const orgFromBody = (req.body as { organizationId?: string })?.organizationId;
    const orgFromQuery = typeof req.query.organizationId === "string" ? req.query.organizationId : undefined;
    const organizationId = orgFromHeader || orgFromBody || orgFromQuery;

    if (!organizationId) {
      return res.status(400).json({ error: "organizationId requerido (header/body/query)." });
    }

    const enforceRbac = process.env.ENFORCE_RBAC === "true";
    if (!enforceRbac) {
      return next();
    }

    const userEmail = req.header("x-user-email");
    if (!userEmail) {
      return res.status(401).json({ error: "x-user-email requerido cuando ENFORCE_RBAC=true." });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true },
    });
    if (!user) {
      return res.status(403).json({ error: "Usuario no encontrado." });
    }

    const membership = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
      select: { role: true },
    });
    if (!membership) {
      return res.status(403).json({ error: "Usuario sin acceso a la organización." });
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const roleSet = new Set([membership.role, user.role]);
      const allowed = requiredRoles.some((role) => roleSet.has(role));
      if (!allowed) {
        return res.status(403).json({ error: "Rol insuficiente para esta operación." });
      }
    }

    return next();
  };
}
