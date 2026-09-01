/** Shopify data-layer errors (plan.md §37, §47). */

export class ShopifyRequestError extends Error {
  readonly status: number;
  readonly operation: string;

  constructor(operation: string, status: number, message: string) {
    super(`Shopify request "${operation}" failed (${status}): ${message}`);
    this.name = "ShopifyRequestError";
    this.status = status;
    this.operation = operation;
  }
}

export class ShopifyGraphQLError extends Error {
  readonly operation: string;
  readonly errors: ReadonlyArray<{ message: string }>;

  constructor(operation: string, errors: ReadonlyArray<{ message: string }>) {
    const detail = errors.map((e) => e.message).join("; ");
    super(`Shopify GraphQL errors in "${operation}": ${detail}`);
    this.name = "ShopifyGraphQLError";
    this.operation = operation;
    this.errors = errors;
  }
}
