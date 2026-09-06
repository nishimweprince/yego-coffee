import { describe, expect, it } from "vitest";
import { AddressSchema, ProfileSchema, ShopifyIdSchema } from "./validation";

const valid = {
  address1: "1212 Broadway",
  city: "Somerville",
  zoneCode: "ma",
  zip: "02144",
};

describe("AddressSchema", () => {
  it("accepts a complete US address", () => {
    const parsed = AddressSchema.parse(valid);
    expect(parsed.zoneCode).toBe("MA");
    expect(parsed.territoryCode).toBe("US");
  });

  it("requires a street address", () => {
    expect(AddressSchema.safeParse({ ...valid, address1: "" }).success).toBe(false);
  });

  it("requires a city", () => {
    expect(AddressSchema.safeParse({ ...valid, city: "  " }).success).toBe(false);
  });

  it("rejects a state name where a code belongs", () => {
    const result = AddressSchema.safeParse({ ...valid, zoneCode: "Massachusetts" });
    expect(result.success).toBe(false);
  });

  it("accepts both ZIP forms", () => {
    expect(AddressSchema.safeParse({ ...valid, zip: "02144" }).success).toBe(true);
    expect(AddressSchema.safeParse({ ...valid, zip: "02144-1234" }).success).toBe(true);
  });

  it("rejects a ZIP that is not one", () => {
    expect(AddressSchema.safeParse({ ...valid, zip: "SW1A 1AA" }).success).toBe(false);
  });

  it("trims whitespace rather than storing it", () => {
    const parsed = AddressSchema.parse({ ...valid, address1: "  1212 Broadway  " });
    expect(parsed.address1).toBe("1212 Broadway");
  });

  it("drops an empty optional rather than sending an empty string", () => {
    expect(AddressSchema.parse({ ...valid, company: "   " }).company).toBeUndefined();
  });
});

describe("ProfileSchema", () => {
  it("accepts a name", () => {
    expect(ProfileSchema.parse({ firstName: "Fatuma" }).firstName).toBe("Fatuma");
  });

  it("accepts an empty update", () => {
    expect(ProfileSchema.safeParse({}).success).toBe(true);
  });

  it("rejects an absurdly long name rather than forwarding it", () => {
    expect(ProfileSchema.safeParse({ firstName: "a".repeat(200) }).success).toBe(false);
  });
});

describe("ShopifyIdSchema", () => {
  it("accepts a Shopify gid", () => {
    expect(
      ShopifyIdSchema.safeParse("gid://shopify/CustomerAddress/123").success,
    ).toBe(true);
  });

  it("rejects an arbitrary string from a form", () => {
    expect(ShopifyIdSchema.safeParse("123").success).toBe(false);
    expect(ShopifyIdSchema.safeParse("../../etc/passwd").success).toBe(false);
  });

  it("rejects a URL wearing a gid's clothes", () => {
    expect(ShopifyIdSchema.safeParse("https://evil.example/gid").success).toBe(false);
  });
});
