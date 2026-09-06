import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrimaryNav } from "./primary-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/about",
}));

describe("PrimaryNav", () => {
  it("renders the five primary destinations", () => {
    render(<PrimaryNav />);
    for (const label of [
      "Shop",
      "Subscriptions",
      "Find Your Coffee",
      "Our Story",
      "Café",
    ]) {
      expect(
        screen.getByRole("link", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("marks only the current destination with aria-current", () => {
    render(<PrimaryNav />);
    expect(screen.getByRole("link", { name: "Our Story" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Shop" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("link", { name: "Café" }),
    ).not.toHaveAttribute("aria-current");
  });
});
