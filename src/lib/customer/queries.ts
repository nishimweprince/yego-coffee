/**
 * Customer Account API operations (plan.md §11, §52).
 *
 * ## Unverified against a live schema
 *
 * These are written from Shopify's Customer Account API
 * documentation. Unlike the Storefront documents, they could not be
 * validated against a published schema — `@shopify/hydrogen-react`
 * ships the Storefront schema only, and there is no equivalent
 * artefact for this API. §95.10's independent check has no counterpart
 * here, which is a real difference in confidence and the reason §104
 * puts these first in line when credentials arrive.
 */

const MONEY = /* GraphQL */ `
  fragment CustomerMoney on MoneyV2 {
    amount
    currencyCode
  }
`;

export const CUSTOMER_QUERY = /* GraphQL */ `
  query CustomerOverview {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        id
        formatted
      }
      orders(first: 3, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillments(first: 1) {
            nodes {
              status
            }
          }
          totalPrice {
            ...CustomerMoney
          }
        }
      }
    }
  }
  ${MONEY}
`;

export const ORDERS_QUERY = /* GraphQL */ `
  query CustomerOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillments(first: 1) {
            nodes {
              status
            }
          }
          totalPrice {
            ...CustomerMoney
          }
          lineItems(first: 5) {
            nodes {
              title
              quantity
            }
          }
        }
      }
    }
  }
  ${MONEY}
`;

export const ORDER_QUERY = /* GraphQL */ `
  query CustomerOrder($id: ID!) {
    order(id: $id) {
      id
      name
      processedAt
      financialStatus
      statusPageUrl
      totalPrice {
        ...CustomerMoney
      }
      subtotal {
        ...CustomerMoney
      }
      totalShipping {
        ...CustomerMoney
      }
      totalTax {
        ...CustomerMoney
      }
      shippingAddress {
        formatted
      }
      fulfillments(first: 10) {
        nodes {
          status
          trackingInformation {
            number
            url
            company
          }
        }
      }
      lineItems(first: 50) {
        nodes {
          title
          quantity
          variantTitle
          image {
            url
            altText
            width
            height
          }
          price {
            ...CustomerMoney
          }
          totalPrice {
            ...CustomerMoney
          }
        }
      }
    }
  }
  ${MONEY}
`;

export const ADDRESSES_QUERY = /* GraphQL */ `
  query CustomerAddresses {
    customer {
      defaultAddress {
        id
      }
      addresses(first: 20) {
        nodes {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          zoneCode
          zip
          territoryCode
          phoneNumber
          formatted
        }
      }
    }
  }
`;

/**
 * Subscription contracts (§11.5).
 *
 * **Expected to return nothing for this store.** Yego's subscriptions
 * are managed by Seal Subscriptions, a third-party app, and are sold
 * as duplicate products rather than native selling plans on the
 * coffees (§92.1, §96.5). Shopify's native `subscriptionContracts`
 * may therefore be empty even for a customer with an active
 * subscription.
 *
 * The UI is built to say so plainly and hand the customer to Shopify's
 * own account portal, which §11.6 requires for anything this API does
 * not support. That is a designed outcome, not a fallback that was
 * never tried.
 */
export const SUBSCRIPTIONS_QUERY = /* GraphQL */ `
  query CustomerSubscriptions($first: Int!) {
    customer {
      subscriptionContracts(first: $first) {
        nodes {
          id
          status
          createdAt
          nextBillingDate
          deliveryPolicy {
            interval
            intervalCount
          }
          lines(first: 10) {
            nodes {
              id
              name
              quantity
              variantTitle
              currentPrice {
                ...CustomerMoney
              }
            }
          }
        }
      }
    }
  }
  ${MONEY}
`;

export const PROFILE_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADDRESS_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressCreate(
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADDRESS_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressUpdate(
    $addressId: ID!
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(
      addressId: $addressId
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADDRESS_DELETE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`;
