"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buttonVariants } from "@/components/ui/button";
import { Field, inputClassName } from "./field";
import { updateProfileAction } from "@/app/account/actions";
import {
  ProfileSchema,
  type ProfileFormValues,
  type ProfileInput,
} from "@/lib/customer/validation";
import type { CustomerProfile } from "@/lib/customer/types";

/**
 * Profile form (plan.md §11, §24).
 *
 * React Hook Form with the same Zod schema the Server Action uses, so
 * the browser and the server cannot disagree about what is valid. The
 * client check is a courtesy; the server check is the control.
 *
 * §24's other requirements: inline errors, input preserved after a
 * failed submit (RHF keeps it), a loading state, a success state, and
 * no double submit.
 */
export function ProfileForm({ profile }: { profile: CustomerProfile }) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setStatus("idle");
        setMessage(null);
        const result = await updateProfileAction(values);
        if (result.ok) {
          setStatus("saved");
        } else {
          setStatus("error");
          setMessage(result.message);
        }
      })}
      className="max-w-md space-y-stack-md"
    >
      <Field id="firstName" label="First name" error={errors.firstName?.message}>
        <input
          id="firstName"
          autoComplete="given-name"
          aria-invalid={Boolean(errors.firstName)}
          className={inputClassName}
          {...register("firstName")}
        />
      </Field>

      <Field id="lastName" label="Last name" error={errors.lastName?.message}>
        <input
          id="lastName"
          autoComplete="family-name"
          aria-invalid={Boolean(errors.lastName)}
          className={inputClassName}
          {...register("lastName")}
        />
      </Field>

      {profile.email ? (
        <Field
          id="email"
          label="Email"
          hint="Changing your email is done through Shopify, from the link in any order email."
        >
          {/* Read-only rather than absent: seeing which address the
              account uses is the point of showing it (§11.6 — link out
              rather than reimplement). */}
          <input
            id="email"
            value={profile.email}
            readOnly
            className={`${inputClassName} text-muted-foreground`}
          />
        </Field>
      ) : null}

      <div className="flex items-center gap-stack-md pt-stack-sm">
        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonVariants({ size: "md" })}
        >
          {isSubmitting ? "Saving…" : "Save"}
        </button>
        <span aria-live="polite" className="text-body-s">
          {status === "saved" ? (
            <span className="text-accent">Saved.</span>
          ) : null}
          {status === "error" && message ? (
            <span className="text-destructive">{message}</span>
          ) : null}
        </span>
      </div>
    </form>
  );
}
