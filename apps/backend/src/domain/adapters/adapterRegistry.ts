import { FacebookAdapter } from "./FacebookAdapter";
import { InstagramAdapter } from "./InstagramAdapter";
import { LinkedInAdapter } from "./LinkedInAdapter";
import { TikTokAdapter } from "./TikTokAdapter";
import { TwitterAdapter } from "./TwitterAdapter";
import { WhatsAppAdapter } from "./WhatsAppAdapter";
import { ISocialAdapter } from "./ISocialAdapter";

export const adapterRegistry: Record<string, ISocialAdapter> = {
  Facebook: new FacebookAdapter(),
  LinkedIn: new LinkedInAdapter(),
  Twitter: new TwitterAdapter(),
  Instagram: new InstagramAdapter(),
  TikTok: new TikTokAdapter(),
  WhatsApp: new WhatsAppAdapter(),
};
