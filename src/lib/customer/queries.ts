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
          cancelledAt
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
      cancelledAt
      cancelReason
      totalRefunded {
        ...CustomerMoney
      }
      returns(first: 5) {
        nodes {
          name
          status
        }
      }
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
 * Subscription contracts (§11.5, §111).
 *
 * Seal Subscriptions sells through native Shopify selling plans — the
 * Storefront API reports each plan group with `appName: "Seal
 * Subscriptions"` — so a subscriber's contract is a native contract
 * and this API reads and changes it. §104.6's premise that it would be
 * empty was mistaken.
 *
 * `intervalCount` is a `Count` object in this API, not an Int, so it
 * takes a selection.
 */
const SUBSCRIPTION_CONTRACT_FIELDS = /* GraphQL */ `
  fragment CustomerSubscriptionContract on SubscriptionContract {
    id
    status
    createdAt
    nextBillingDate
    lastPaymentStatus
    deliveryPolicy {
      interval
      intervalCount {
        count
      }
    }
    deliveryPrice {
      ...CustomerMoney
    }
    lines(first: 10) {
      nodes {
        id
        name
        title
        quantity
        variantTitle
        currentPrice {
          ...CustomerMoney
        }
        image {
          url
          altText
        }
      }
    }
    upcomingBillingCycles(first: 4) {
      nodes {
        cycleIndex
        billingAttemptExpectedDate
        skipped
        status
      }
    }
  }
`;

export const SUBSCRIPTIONS_QUERY = /* GraphQL */ `
  query CustomerSubscriptions($first: Int!) {
    customer {
      subscriptionContracts(first: $first, reverse: true) {
        nodes {
          ...CustomerSubscriptionContract
        }
      }
    }
  }
  ${SUBSCRIPTION_CONTRACT_FIELDS}
  ${MONEY}
`;

export const SUBSCRIPTION_QUERY = /* GraphQL */ `
  query CustomerSubscription($id: ID!) {
    customer {
      subscriptionContract(id: $id) {
        ...CustomerSubscriptionContract
      }
    }
  }
  ${SUBSCRIPTION_CONTRACT_FIELDS}
  ${MONEY}
`;

/*
 * The five changes a customer can make to a contract from here
 * (§111). Each returns the contract's new state and Shopify's own
 * userErrors; the page shows what Shopify said rather than assuming.
 */

export const SUBSCRIPTION_PAUSE_MUTATION = /* GraphQL */ `
  mutation SubscriptionContractPause($subscriptionContractId: ID!) {
    subscriptionContractPause(subscriptionContractId: $subscriptionContractId) {
      contract {
        id
        status
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const SUBSCRIPTION_ACTIVATE_MUTATION = /* GraphQL */ `
  mutation SubscriptionContractActivate($subscriptionContractId: ID!) {
    subscriptionContractActivate(subscriptionContractId: $subscriptionContractId) {
      contract {
        id
        status
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const SUBSCRIPTION_CANCEL_MUTATION = /* GraphQL */ `
  mutation SubscriptionContractCancel($subscriptionContractId: ID!) {
    subscriptionContractCancel(subscriptionContractId: $subscriptionContractId) {
      contract {
        id
        status
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const BILLING_CYCLE_SKIP_MUTATION = /* GraphQL */ `
  mutation SubscriptionBillingCycleSkip(
    $billingCycleInput: SubscriptionBillingCycleInput!
  ) {
    subscriptionBillingCycleSkip(billingCycleInput: $billingCycleInput) {
      billingCycle {
        cycleIndex
        skipped
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const BILLING_CYCLE_UNSKIP_MUTATION = /* GraphQL */ `
  mutation SubscriptionBillingCycleUnskip(
    $billingCycleInput: SubscriptionBillingCycleInput!
  ) {
    subscriptionBillingCycleUnskip(billingCycleInput: $billingCycleInput) {
      billingCycle {
        cycleIndex
        skipped
      }
      userErrors {
        field
        message
      }
    }
  }
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
