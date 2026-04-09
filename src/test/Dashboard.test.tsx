import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "../pages/Dashboard";
import { MemoryRouter } from "react-router-dom";

describe("Dashboard", () => {
  it("renders the dashboard title", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Overview/i)).toBeInTheDocument();
  });
});
