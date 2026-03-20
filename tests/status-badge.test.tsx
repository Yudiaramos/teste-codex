import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/norms/status-badge";

describe("StatusBadge", () => {
  it("renderiza o texto do status", () => {
    render(<StatusBadge status="vigente" />);

    expect(screen.getByText("Vigente")).toBeInTheDocument();
  });
});
