"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buttonVariants } from "@/components/ui/button";
import { Field, inputClassName } from "./field";
import { createAddressAction, updateAddressAction } from "@/app/account/actions";
import {
  AddressSchema,
  type AddressFormValues,
  type AddressInput,
} from "@/lib/customer/validation";
import type { CustomerAddress } from "@/lib/customer/types";

/**
 * Address form (plan.md §24).
 *
 * Used for both creating and editing: the only difference is which
 * action it calls, so the validation, the field order and the error
 * handling cannot drift apart between the two.
 */
export function AddressForm({
  address,
  onDone,
}: {
  address?: CustomerAddress;
  onDone: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues, unknown, AddressInput>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      firstName: address?.firstName ?? "",
      lastName: address?.lastName ?? "",
      company: address?.company ?? "",
      address1: address?.address1 ?? "",
      address2: address?.address2 ?? "",
      city: address?.city ?? "",
      zoneCode: address?.zoneCode ?? "",
      zip: address?.zip ?? "",
      territoryCode: address?.territoryCode ?? "US",
      phoneNumber: address?.phone ?? "",
      setAsDefault: address?.isDefault ?? false,
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setMessage(null);
        const result = address
          ? await updateAddressAction(address.id, values)
          : await createAddressAction(values);

        if (result.ok) {
          onDone();
          return;
        }

        // Shopify's field-level errors are attached to their fields, so
        // the customer sees them where they can act on them.
        for (const [field, error] of Object.entries(result.fieldErrors ?? {})) {
          setError(field as keyof AddressFormValues, { message: error });
        }
        setMessage(result.message);
      })}
      className="space-y-stack-md"
    >
      <div className="grid gap-stack-md sm:grid-cols-2">
        <Field id="firstName" label="First name" error={errors.firstName?.message}>
          <input id="firstName" autoComplete="given-name" className={inputClassName} {...register("firstName")} />
        </Field>
        <Field id="lastName" label="Last name" error={errors.lastName?.message}>
          <input id="lastName" autoComplete="family-name" className={inputClassName} {...register("lastName")} />
        </Field>
      </div>

      <Field id="address1" label="Street address" error={errors.address1?.message}>
        <input
          id="address1"
          autoComplete="address-line1"
          aria-invalid={Boolean(errors.address1)}
          className={inputClassName}
          {...register("address1")}
        />
      </Field>

      <Field id="address2" label="Apartment, suite (optional)" error={errors.address2?.message}>
        <input id="address2" autoComplete="address-line2" className={inputClassName} {...register("address2")} />
      </Field>

      <div className="grid gap-stack-md sm:grid-cols-3">
        <Field id="city" label="City" error={errors.city?.message}>
          <input
            id="city"
            autoComplete="address-level2"
            aria-invalid={Boolean(errors.city)}
            className={inputClassName}
            {...register("city")}
          />
        </Field>
        <Field id="zoneCode" label="State" error={errors.zoneCode?.message} hint="Two letters">
          <input
            id="zoneCode"
            autoComplete="address-level1"
            maxLength={2}
            aria-invalid={Boolean(errors.zoneCode)}
            className={inputClassName}
            {...register("zoneCode")}
          />
        </Field>
        <Field id="zip" label="ZIP" error={errors.zip?.message}>
          <input
            id="zip"
            autoComplete="postal-code"
            inputMode="numeric"
            aria-invalid={Boolean(errors.zip)}
            className={inputClassName}
            {...register("zip")}
          />
        </Field>
      </div>

      <Field id="phoneNumber" label="Phone (optional)" error={errors.phoneNumber?.message}>
        <input id="phoneNumber" autoComplete="tel" type="tel" className={inputClassName} {...register("phoneNumber")} />
      </Field>

      <label className="flex items-center gap-3 text-body-m">
        <input type="checkbox" className="size-4" {...register("setAsDefault")} />
        Use as my default address
      </label>

      <div className="flex flex-wrap items-center gap-stack-md pt-stack-sm">
        <button type="submit" disabled={isSubmitting} className={buttonVariants({ size: "md" })}>
          {isSubmitting ? "Saving…" : address ? "Save changes" : "Add address"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className={buttonVariants({ variant: "ghost", size: "md" })}
        >
          Cancel
        </button>
        <span aria-live="polite" className="text-body-s text-destructive">
          {message}
        </span>
      </div>
    </form>
  );
}
