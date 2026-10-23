import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductPurchaseForm } from "./product-purchase-form";
import { CART_OPEN } from "@/lib/cart/events";
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
    tags: [],
    productType: "",
    hasSellingPlanGroup: false,
    seoTitle: null,
    seoDescription: null,
    requiresSellingPlan: false,
    bagsPerDelivery: null,
    shareImageUrl: null,
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
        subscriptionOptions: [],
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
        subscriptionOptions: [],
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

    expect(addToCart).toHaveBeenCalledWith(
      "gid://shopify/ProductVariant/1",
      1,
      undefined,
    );
  });

  it("adds the variant the customer selected, not the default", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("radio", { name: "Ground" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addToCart).toHaveBeenCalledWith(
      "gid://shopify/ProductVariant/2",
      1,
      undefined,
    );
  });

  it("passes the chosen quantity through", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("button", { name: /increase quantity/i }));
    await user.click(screen.getByRole("button", { name: /increase quantity/i }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addToCart).toHaveBeenCalledWith(
      "gid://shopify/ProductVariant/1",
      3,
      undefined,
    );
  });

  it("confirms the add by opening the cart drawer", async () => {
    const opened = vi.fn();
    window.addEventListener(CART_OPEN, opened);

    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    await vi.waitFor(() => expect(opened).toHaveBeenCalled());
    window.removeEventListener(CART_OPEN, opened);
  });

  it("surfaces a failure instead of silently doing nothing", async () => {
    addToCart.mockResolvedValue({ ok: false, message: "Not enough inventory" });
    const opened = vi.fn();
    window.addEventListener(CART_OPEN, opened);
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={product()} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(await screen.findByText("Not enough inventory")).toBeInTheDocument();
    expect(opened).not.toHaveBeenCalled();
    window.removeEventListener(CART_OPEN, opened);
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
          subscriptionOptions: [],
        },
      ],
    });
    render(<ProductPurchaseForm product={soldOut} />);

    expect(screen.getByRole("button", { name: "Sold out" })).toBeDisabled();
    expect(addToCart).not.toHaveBeenCalled();
  });
});

describe("ProductPurchaseForm — subscriptions", () => {
  /**
   * The bug this covers: the form rendered the schedules Shopify
   * offers, and then added the item as a one-time purchase regardless.
   * A customer reading "Every month $17.00" above the button had every
   * reason to believe they had subscribed, and they had not.
   */
  const plan = {
    sellingPlanId: "gid://shopify/SellingPlan/1",
    name: "Monthly membership",
    description: null,
    frequencyLabel: "Once a month",
    interval: "MONTH" as const,
    intervalCount: 1,
    price: { amount: "17.00", currencyCode: "USD" },
    compareAtPrice: null,
    savingsPercentage: null,
  };

  function subscribable(): ProductDetailModel {
    const base = product();
    return {
      ...base,
      variants: [
        // Only the first variant carries the plan, mirroring Gatare,
        // whose group covers its 5 lb variant alone (§96.6).
        { ...base.variants[0], subscriptionOptions: [plan] },
        { ...base.variants[1], subscriptionOptions: [] },
      ],
    };
  }

  it("adds a one-time purchase until a schedule is chosen", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={subscribable()} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addToCart).toHaveBeenCalledWith(
      "gid://shopify/ProductVariant/1",
      1,
      undefined,
    );
  });

  it("passes the chosen selling plan through", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={subscribable()} />);

    await user.click(screen.getByRole("radio", { name: /Once a month/ }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addToCart).toHaveBeenCalledWith(
      "gid://shopify/ProductVariant/1",
      1,
      "gid://shopify/SellingPlan/1",
    );
  });

  it("drops a schedule the newly selected variant does not offer", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={subscribable()} />);

    await user.click(screen.getByRole("radio", { name: /Once a month/ }));
    // Ground carries no plan; carrying the monthly one over would
    // enrol the customer in a subscription for a variant Shopify does
    // not sell on that plan.
    await user.click(screen.getByRole("radio", { name: "Ground" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addToCart).toHaveBeenCalledWith(
      "gid://shopify/ProductVariant/2",
      1,
      undefined,
    );
  });

  it("offers no schedule at all when the store publishes none", () => {
    render(<ProductPurchaseForm product={product()} />);

    expect(screen.queryByText("Delivery")).not.toBeInTheDocument();
  });
});

describe("ProductPurchaseForm — subscription only", () => {
  /**
   * Roaster's Choice cannot be bought once (§109). The review of
   * 2026-10-23 found "One time" offered and preselected on it anyway.
   */
  const monthly = {
    sellingPlanId: "gid://shopify/SellingPlan/monthly",
    name: "Once a month",
    description: null,
    frequencyLabel: "Once a month",
    interval: "MONTH" as const,
    intervalCount: 1,
    price: { amount: "58.00", currencyCode: "USD" },
    compareAtPrice: null,
    savingsPercentage: null,
  };
  const fortnightly = {
    ...monthly,
    sellingPlanId: "gid://shopify/SellingPlan/fortnightly",
    name: "Twice a month",
    frequencyLabel: "Every 2 weeks",
    interval: "WEEK" as const,
    intervalCount: 2,
  };

  function roastersChoice(
    subscriptionOptions = [fortnightly, monthly],
  ): ProductDetailModel {
    const base = product();
    return {
      ...base,
      handle: "roasters-choice-three-bags-subscription",
      title: "Roaster's Choice - Three Bags Subscription",
      requiresSellingPlan: true,
      bagsPerDelivery: 3,
      options: [],
      variants: [
        {
          ...base.variants[0],
          price: { amount: "58.00", currencyCode: "USD" },
          selectedOptions: [],
          subscriptionOptions,
        },
      ],
    };
  }

  it("does not offer a one-time purchase", () => {
    render(<ProductPurchaseForm product={roastersChoice()} />);
    expect(screen.queryByRole("radio", { name: /One time/ })).not.toBeInTheDocument();
  });

  it("preselects the monthly plan, whatever order Shopify sends", async () => {
    const user = userEvent.setup();
    render(<ProductPurchaseForm product={roastersChoice()} />);

    expect(screen.getByRole("radio", { name: /Once a month/ })).toBeChecked();
    await user.click(screen.getAllByRole("button", { name: /Add to cart/ })[0]);

    expect(addToCart).toHaveBeenCalledWith(
      "gid://shopify/ProductVariant/1",
      1,
      "gid://shopify/SellingPlan/monthly",
    );
  });

  it("states the per-bag price from Shopify's price", () => {
    render(<ProductPurchaseForm product={roastersChoice()} />);
    expect(screen.getByText("3 bags, $19.33 a bag")).toBeInTheDocument();
  });

  it("cannot be added when the variant carries no plan", () => {
    render(<ProductPurchaseForm product={roastersChoice([])} />);
    for (const button of screen.getAllByRole("button", {
      name: /Not available as a subscription/,
    }))
      expect(button).toBeDisabled();
  });
});
