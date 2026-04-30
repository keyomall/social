import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/api-client", () => ({
  apiGet: vi.fn(async () => ({
    success: true,
    report: {
      overallScore: 72,
      maturityLevel: "MVP avanzado",
      completedWeight: 18,
      totalWeight: 25,
      categories: [
        { id: "core", name: "Core Backend", score: 80, items: [] },
        { id: "quality", name: "Calidad y Testing", score: 60, items: [] },
      ],
      nextPriorities: ["Completar adapters OAuth"],
    },
  })),
}));

import { ProjectProgress } from "./ProjectProgress";

describe("ProjectProgress", () => {
  it("renderiza score y categorías", async () => {
    render(<ProjectProgress />);
    await waitFor(() => expect(screen.getByText("72%")).toBeInTheDocument());
    expect(screen.getByText("Core Backend")).toBeInTheDocument();
    expect(screen.getByText("Calidad y Testing")).toBeInTheDocument();
  });
});
