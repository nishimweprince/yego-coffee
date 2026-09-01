export const CART_LINE_FRAGMENT = /* GraphQL */ `
  fragment CartLineFragment on CartLine {
    id
    quantity
    cost {
      totalAmount {
        ...MoneyFragment
      }
      amountPerQuantity {
        ...MoneyFragment
      }
    }
    sellingPlanAllocation {
      sellingPlan {
        name
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        availableForSale
        image {
          ...ImageFragment
        }
        product {
          title
          handle
        }
      }
    }
  }
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
    }
    lines(first: 100) {
      edges {
        node {
          ...CartLineFragment
        }
      }
    }
  }
`;
