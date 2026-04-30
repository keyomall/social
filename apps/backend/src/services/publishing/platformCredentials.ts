export function hasRequiredCredentials(platform: string, credentials: Record<string, unknown>): boolean {
  const normalized = platform.toLowerCase();

  const requiredByPlatform: Record<string, string[]> = {
    facebook: ["accessToken", "pageId"],
    twitter: ["accessToken"],
    linkedin: ["linkedInId"],
    instagram: ["igAccountId", "accessToken"],
    tiktok: ["accessToken"],
    whatsapp: ["phoneNumberId", "accessToken"],
  };

  const required = requiredByPlatform[normalized] || [];
  if (required.length === 0) return true;

  return required.every((field) => {
    const value = credentials[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}
