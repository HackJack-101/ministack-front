import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "./utils";
import { Dashboard } from "../pages/Dashboard";

describe("Dashboard", () => {
  it("renders the dashboard title", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
    });
  });
});
