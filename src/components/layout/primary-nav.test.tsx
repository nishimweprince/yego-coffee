import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrimaryNav } from "./primary-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/about",
}));

describe("PrimaryNav", () => {
  it("renders the four primary destinations", () => {
    render(<PrimaryNav />);
    for (const label of ["Shop", "Subscriptions", "Our story", "Café"]) {
      expect(
        screen.getByRole("link", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("no longer links the removed quiz", () => {
    render(<PrimaryNav />);
    expect(screen.queryByRole("link", { name: /find your coffee/i })).toBeNull();
  });

  it("marks only the current destination with aria-current", () => {
    render(<PrimaryNav />);
    expect(screen.getByRole("link", { name: "Our story" })).toHaveAttribute(
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
