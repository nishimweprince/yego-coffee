import { formatCadence } from "../cadence";
import type { ApiCart } from "../types.api";
import type { CartModel } from "../types";

export function mapCart(cart: ApiCart): CartModel {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.cost.subtotalAmount,
    total: cart.cost.totalAmount,
    lines: cart.lines.edges.map((edge) => {
      const line = edge.node;
      return {
        id: line.id,
        quantity: line.quantity,
        merchandiseId: line.merchandise.id,
        productTitle: line.merchandise.product.title,
        productHandle: line.merchandise.product.handle,
        variantTitle: line.merchandise.title,
        image: line.merchandise.image,
        // Shopify computes both; never derive one from the other, since
        // discounts apply at the line level (§2.1).
        unitPrice: line.cost.amountPerQuantity,
        lineTotal: line.cost.totalAmount,
        sellingPlanName:
          line.sellingPlanAllocation?.sellingPlan?.name ?? null,
        sellingPlanCadence: formatCadence(
          line.sellingPlanAllocation?.sellingPlan?.deliveryPolicy?.interval ??
            null,
          line.sellingPlanAllocation?.sellingPlan?.deliveryPolicy
            ?.intervalCount ?? null,
        ),
        availableForSale: line.merchandise.availableForSale,
      };
    }),
  };
}
