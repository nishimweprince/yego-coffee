import type { ProductDetailModel, ProductVariantModel } from "@/lib/shopify/types";

/**
 * Fixtures modelled on Yego's real catalogue (§96.4), including the
 * parts that are awkward: negative inventory, a coffee whose roasts
 * live in an option, and subscriptions sold as separate products.
 */

export function variant(
  overrides: Partial<ProductVariantModel> & { id: string },
): ProductVariantModel {
  return {
    title: "12 oz / Whole Beans",
    availableForSale: true,
    quantityAvailable: -10,
    price: { amount: "19.00", currencyCode: "USD" },
    compareAtPrice: null,
    selectedOptions: [
      { name: "Size", value: "12 oz" },
      { name: "Type", value: "Whole Beans" },
    ],
    image: null,
    subscriptionOptions: [],
    ...overrides,
  };
}

export function product(
  overrides: Partial<ProductDetailModel> & { handle: string },
): ProductDetailModel {
  return {
    id: overrides.handle,
    title: overrides.handle,
    featuredImage: null,
    minPrice: { amount: "19.00", currencyCode: "USD" },
    maxPrice: { amount: "19.00", currencyCode: "USD" },
    availableForSale: true,
    tags: [],
    productType: "",
    options: [],
    hasSellingPlanGroup: false,
    description: "",
    descriptionHtml: "",
    media: [],
    seoTitle: null,
    seoDescription: null,
    variants: [variant({ id: `${overrides.handle}-v1` })],
    ...overrides,
  };
}

/** Both grinds, as the real 12 oz coffees have. */
function grindVariants(handle: string, amount = "19.00") {
  return [
    variant({
      id: `${handle}-whole`,
      title: "12 oz / Whole Bean",
      price: { amount, currencyCode: "USD" },
      selectedOptions: [
        { name: "Size", value: "12 oz" },
        { name: "Type", value: "Whole Bean" },
      ],
    }),
    variant({
      id: `${handle}-ground`,
      title: "12 oz / Ground",
      price: { amount, currencyCode: "USD" },
      selectedOptions: [
        { name: "Size", value: "12 oz" },
        { name: "Type", value: "Ground" },
      ],
    }),
  ];
}

export const mediumRoast = product({
  handle: "medium-roast",
  title: "Medium Roast",
  tags: ["coffee", "medium", "roast"],
  options: [
    { id: "o1", name: "Size", values: ["12 oz"] },
    { id: "o2", name: "Type", values: ["Whole Bean", "Ground"] },
  ],
  variants: grindVariants("medium-roast"),
});

export const darkRoast = product({
  handle: "dark-roast",
  title: "Dark Roast",
  tags: ["coffee", "dark", "roast"],
  options: [
    { id: "o1", name: "Size", values: ["12 oz"] },
    { id: "o2", name: "Type", values: ["Whole bean", "Ground"] },
  ],
  variants: grindVariants("dark-roast"),
});

export const gatare = product({
  handle: "light-roast",
  title: "Gatare Anaerobic Process.",
  tags: ["coffee", "light", "roast"],
  minPrice: { amount: "25.00", currencyCode: "USD" },
  maxPrice: { amount: "150.00", currencyCode: "USD" },
  variants: [
    variant({
      id: "gatare-12oz",
      price: { amount: "25.00", currencyCode: "USD" },
    }),
    variant({
      id: "gatare-5lb",
      title: "5 lbs / Whole Beans",
      price: { amount: "150.00", currencyCode: "USD" },
      selectedOptions: [
        { name: "Size", value: "5 lbs" },
        { name: "Type", value: "Whole Beans" },
      ],
    }),
  ],
});

/** Carries every roast as an option, like the real 5 lb Bag. */
export const fiveLbBag = product({
  handle: "5-lb-bag",
  title: "5 lb Bag",
  tags: ["coffee", "dark", "medium", "roast"],
  options: [{ id: "o1", name: "Roast", values: ["Light", "Medium", "Dark"] }],
  minPrice: { amount: "95.00", currencyCode: "USD" },
  maxPrice: { amount: "95.00", currencyCode: "USD" },
  variants: [
    variant({
      id: "bag-medium",
      title: "Medium",
      price: { amount: "95.00", currencyCode: "USD" },
      selectedOptions: [{ name: "Roast", value: "Medium" }],
    }),
  ],
});

/**
 * Mirrors the real duplicates: two variants that differ only by grind,
 * both "12 oz", each carrying the same plan. The grind spelling is
 * Shopify's own inconsistent "Whole bean" (§96.3).
 */
export function subscriptionProduct(
  handle: string,
  interval: "DAY" | "WEEK" | "MONTH",
  intervalCount: number,
  amount = "17.00",
): ProductDetailModel {
  const plan = () => [
    {
      sellingPlanId: `${handle}-plan`,
      name: "plan",
      description: null,
      frequencyLabel: "",
      interval,
      intervalCount,
      price: { amount, currencyCode: "USD" },
      compareAtPrice: null,
      savingsPercentage: null,
    },
  ];

  return product({
    handle,
    title: handle,
    hasSellingPlanGroup: true,
    variants: [
      variant({
        id: `${handle}-whole`,
        title: "12 oz / Whole bean",
        price: { amount, currencyCode: "USD" },
        selectedOptions: [
          { name: "Size", value: "12 oz" },
          { name: "Type", value: "Whole bean" },
        ],
        subscriptionOptions: plan(),
      }),
      variant({
        id: `${handle}-ground`,
        title: "12 oz / Ground",
        price: { amount, currencyCode: "USD" },
        selectedOptions: [
          { name: "Size", value: "12 oz" },
          { name: "Type", value: "Ground" },
        ],
        subscriptionOptions: plan(),
      }),
    ],
  });
}
