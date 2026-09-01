import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductPurchaseForm } from "./product-purchase-form";
import type { ProductDetailModel } from "@/lib/shopify/types";

/**
 * The PDP end of the PDP → cart chain (plan.md §40).
 *
 * The action itself is covered by cart.integration.test.ts; what
 * matters here is that the form hands it the variant the customer
 * actually chose, at the quantity they chose.
 */

const addToCart = vi.fn();
vi.mock("@/app/actions/cart", () => ({
  addToCartAction: (...args: unknown[]) => addToCart(...args),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function product(overrides: Partial<ProductDetailModel> = {}): ProductDetailModel {
  return {
    id: "gid://shopify/Product/1",
    handle: "medium-roast",
    title: "Medium Roast",
    description: "",
    descriptionHtml: "",
    featuredImage: null,
    media: [],
    minPrice: { amount: "19.00", currencyCode: "USD" },
    maxPrice: { amount: "19.00", currencyCode: "USD" },
    availableForSale: true,
    subscriptionAvailable: false,
    seoTitle: null,
    seoDescription: null,
    options: [{ id: "o1", name: "Grind", values: ["Whole bean", "Ground"] }],
    variants: [
      {
        id: "gid://shopify/ProductVariant/1",
        title: "Whole bean",
        availableForSale: true,
        quantityAvailable: null,
        price: { amount: "19.00", currencyCode: "USD" },
        compareAtPrice: null,
        selectedOptions: [{ name: "Grind", value: "Whole bean" }],
        image: null,
      },
      {
        id: "gid://shopify/ProductVariant/2",
        title: "Ground",
        availableForSale: true,
        quantityAvailable: null,
        price: { amount: "19.00", currencyCode: "USD" },
        compareAtPrice: null,
        selectedOptions: [{ name: "Grind", value: "Ground" }],
        image: null,
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  addToCart.mockReset();
  addToCart.mockResolvedValue({
    ok: true,
    cart: { id: "c1", checkoutUrl: "", totalQuantity: 1, lines: [],
      subtotal: { amount: "19.00", currencyCode: "USD" },
      total: { amount: "19.00", currencyCode: "USD" } },
  });
});

describe("ProductPurchaseForm", () => {
  it("adds the default variant at quantity 1", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addToCart).toHaveBeenCalledWith("gid://shopify/ProductVariant/1", 1);
  });

  it("adds the variant the customer selected, not the default", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("radio", { name: "Ground" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addToCart).toHaveBeenCalledWith("gid://shopify/ProductVariant/2", 1);
  });

  it("passes the chosen quantity through", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("button", { name: /increase quantity/i }));
    await user.click(screen.getByRole("button", { name: /increase quantity/i }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addToCart).toHaveBeenCalledWith("gid://shopify/ProductVariant/1", 3);
  });

  it("confirms the add and offers the cart", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(await screen.findByRole("link", { name: "View cart" })).toBeInTheDocument();
  });

  it("surfaces a failure instead of silently doing nothing", async () => {
    addToCart.mockResolvedValue({ ok: false, message: "Not enough inventory" });
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(await screen.findByText("Not enough inventory")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View cart" })).not.toBeInTheDocument();
  });

  it("cannot be submitted for a sold-out product", async () => {
    const soldOut = product({
      availableForSale: false,
      variants: [
        {
          id: "gid://shopify/ProductVariant/3",
          title: "Whole bean",
          availableForSale: false,
          quantityAvailable: 0,
          price: { amount: "19.00", currencyCode: "USD" },
          compareAtPrice: null,
          selectedOptions: [{ name: "Grind", value: "Whole bean" }],
          image: null,
        },
      ],
    });
    render(<ProductPurchaseForm product={soldOut} />);

    expect(screen.getByRole("button", { name: "Sold out" })).toBeDisabled();
    expect(addToCart).not.toHaveBeenCalled();
  });
});
