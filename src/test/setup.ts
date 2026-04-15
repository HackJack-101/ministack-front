import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock fetch for relative URLs and global availability in node environment
globalThis.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  }),
) as typeof fetch;
