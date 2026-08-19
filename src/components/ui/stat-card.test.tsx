import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "@/components/ui/stat-card";

describe("StatCard", () => {
  it("renders a labelled metric and supporting detail", () => {
    render(
      <StatCard
        label="Reviews waiting"
        value={3}
        detail="Needs manager action"
      />,
    );
    expect(screen.getByText("Reviews waiting")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Needs manager action")).toBeInTheDocument();
  });
});
