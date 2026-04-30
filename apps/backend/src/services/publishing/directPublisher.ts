import { SocialPostPayload } from "../../domain/adapters/ISocialAdapter";
import { adapterRegistry } from "../../domain/adapters/adapterRegistry";
import { prisma } from "../../lib/prisma";

export async function publishDirectly(params: {
  platform: string;
  payload: SocialPostPayload;
  credentials: Record<string, unknown>;
  postId: string;
}): Promise<{ success: boolean; error?: string }> {
  const adapter = adapterRegistry[params.platform];
  if (!adapter) {
    await prisma.post.update({
      where: { id: params.postId },
      data: { status: "FAILED", lastError: `Plataforma no soportada: ${params.platform}` },
    });
    return { success: false, error: "Plataforma no soportada" };
  }

  const result = await adapter.publish(params.payload, params.credentials);
  if (!result.success) {
    await prisma.post.update({
      where: { id: params.postId },
      data: { status: "FAILED", lastError: result.error || "Error de publicación directa" },
    });
    return { success: false, error: result.error || "Error de publicación directa" };
  }

  await prisma.post.update({
    where: { id: params.postId },
    data: { status: "PUBLISHED", platformPostId: result.platformId || null, lastError: null },
  });
  return { success: true };
}
