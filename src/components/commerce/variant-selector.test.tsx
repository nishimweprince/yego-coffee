import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VariantSelector } from "./variant-selector";
import type { ProductOptionModel, ProductVariantModel } from "@/lib/shopify/types";

function variant(
  id: string,
  options: Array<[string, string]>,
  availableForSale = true,
): ProductVariantModel {
  return {
    id,
    title: options.map(([, v]) => v).join(" / "),
    availableForSale,
    quantityAvailable: null,
    price: { amount: "19.00", currencyCode: "USD" },
    compareAtPrice: null,
    selectedOptions: options.map(([name, value]) => ({ name, value })),
    image: null,
  };
}

const options: ProductOptionModel[] = [
  { id: "o1", name: "Grind", values: ["Whole bean", "Ground"] },
];

const variants = [
  variant("v1", [["Grind", "Whole bean"]]),
  variant("v2", [["Grind", "Ground"]], false),
];

describe("VariantSelector", () => {
  it("renders options as real radio inputs, not styled divs", () => {
    render(
      <VariantSelector
        options={options}
        variants={variants}
        selection={{ Grind: "Whole bean" }}
        onSelect={vi.fn()}
      />,
    );
    // Semantic radios are what keep this keyboard- and SR-operable (§35).
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("marks the current selection as checked", () => {
    render(
      <VariantSelector
        options={options}
        variants={variants}
        selection={{ Grind: "Whole bean" }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: "Whole bean" })).toBeChecked();
  });

  it("disables a value that leads only to sold-out variants", () => {
    render(
      <VariantSelector
        options={options}
        variants={variants}
        selection={{ Grind: "Whole bean" }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: "Ground" })).toBeDisabled();
  });

  it("groups options in a labelled fieldset", () => {
    render(
      <VariantSelector
        options={options}
        variants={variants}
        selection={{ Grind: "Whole bean" }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("group", { name: "Grind" })).toBeInTheDocument();
  });

  it("renders nothing for Shopify's synthetic single-variant product", () => {
    const { container } = render(
      <VariantSelector
        options={[{ id: "o", name: "Title", values: ["Default Title"] }]}
        variants={[variant("v", [["Title", "Default Title"]])]}
        selection={{ Title: "Default Title" }}
        onSelect={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
