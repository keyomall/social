import { Router } from "express";
import { generateProfileRecommendation, ProfileInput } from "../domain/analytics/profileAnalysis";

const router = Router();

router.post("/analyze-profile", async (req, res) => {
  try {
    const payload = req.body as { profiles?: ProfileInput[] };
    const profiles = Array.isArray(payload?.profiles) ? payload.profiles : [];

    if (profiles.length === 0) {
      return res.status(400).json({ error: "profiles es requerido y debe tener al menos un elemento" });
    }

    const recommendation = generateProfileRecommendation(profiles);
    return res.json({ success: true, recommendation });
  } catch (error) {
    return res.status(500).json({ error: "Error al analizar perfiles" });
  }
});

export default router;
