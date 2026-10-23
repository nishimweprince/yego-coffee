# Subscription policy — draft for Shopify

**Status:** this is a draft for the owners to review (§108, client feedback 2026-10-23). Nothing here is live until it is pasted into Shopify.

**Where it goes:** Shopify admin → Settings → Policies → *Purchase options cancellation policy*. Keep the `Subscriptions` heading exactly as written. The site finds that heading and quotes the sentence containing "cancel or change" beside every plan, so both must survive the paste (`src/lib/content/reassurance.ts`).

Lines marked **[confirm]** are assumptions. Check each one against how the store is actually set up, then delete the marker. Never publish one you cannot confirm.

---

## Subscriptions

A Yego Coffee subscription sends you freshly roasted coffee on a schedule you choose. You can cancel or change your subscription at any time before your next order is processed.

### How often

- **Once a month:** one delivery every month.
- **Every 2 weeks:** 26 deliveries a year, so some months have three.

The schedule you picked is shown at checkout and in your order confirmation.

### What you pay

- Roaster's Choice is sold by subscription only. The more bags in each delivery, the lower the price per bag.
- Shipping is $7 on each delivery, and free on orders over $40. **[confirm the free threshold also applies to recurring orders, not only the first]**
- You are charged when each order is processed, not all at once. **[confirm: the billing moment set in the subscription app]**
- The first order is charged at checkout.

### Changing, skipping or cancelling

Your order confirmation email has a link to manage your subscription. Use it to:

- change how often it arrives
- skip a delivery
- change your coffee **[confirm the app allows this]**
- cancel

Changes made before your next order is processed apply to that order. Changes made after it apply to the one after. **[confirm the processing cut-off, e.g. "3 days before"]**

There is no minimum number of deliveries and no cancellation fee.

If you can't find the link, email francois@yegocoffee.com and we'll make the change for you.

### If a payment fails

We'll email you and try the payment again. If it still can't be taken, the subscription is paused until you update your payment details. **[confirm the app's retry and pause behaviour]**

### Delivery

We ship within the United States. Each order is roasted before it ships. Problems with a delivery are covered by our Shipping Policy and Refund Policy.

### Price changes

If the price of your coffee changes, we'll email you before the new price applies to your next order. **[confirm notice period]**
