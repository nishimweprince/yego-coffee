import { AccountNotConfigured } from "@/components/account/not-configured";
import { OrderHistory } from "@/components/account/order-history";
import { Contour } from "@/components/ui/contour";
import { getOrders } from "@/lib/customer/account";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { requireCustomerSession } from "@/lib/customer/guard";

/** Order history (plan.md §11.3). */
export default async function OrdersPage() {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;
  await requireCustomerSession("/account/orders");

  const orders = await getOrders();
  if (orders === null) return <AccountNotConfigured />;

  return (
    <div>
      <h1 className="text-h1">Orders</h1>
      <Contour
        label={`${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
        className="mt-section-sm"
      />
      <div className="mt-section-sm">
        <OrderHistory orders={orders} />
      </div>
    </div>
  );
}
