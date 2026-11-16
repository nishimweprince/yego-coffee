"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscribeToNewsletterAction } from "@/app/actions/newsletter";
import { buttonVariants } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/control";
import { track } from "@/lib/analytics/analytics";
import {
  NewsletterSchema,
  type NewsletterFormValues,
  type NewsletterInput,
} from "@/lib/newsletter/validation";
import { cn } from "@/lib/utils";

/**
 * The footer's newsletter signup (plan.md §50, §24).
 *
 * React Hook Form with the Server Action's own Zod schema. One field,
 * a real label, inline errors, no double submit, and a success line
 * that replaces the form so it cannot be sent twice by accident.
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues, unknown, NewsletterInput>({
    resolver: zodResolver(NewsletterSchema),
    defaultValues: { email: "", website: "" },
  });

  if (done) {
    return (
      <p role="status" className="text-body-m">
        Thanks — you&rsquo;re on the list.
      </p>
    );
  }

  const error = errors.email?.message ?? message;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setMessage(null);
        const result = await subscribeToNewsletterAction(values);
        if (result.ok) {
          track({ name: "newsletter_subscribed" });
          setDone(true);
        } else {
          setMessage(result.message);
        }
      })}
      className="w-full"
    >
      <label htmlFor="newsletter-email" className="label text-muted-foreground">
        Email address
      </label>
      <div className="mt-stack-xs flex flex-col gap-stack-sm sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "newsletter-error" : undefined}
          className={cn(inputClassName, "min-h-12 flex-1")}
          {...register("email")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonVariants({ size: "md", className: "shrink-0" })}
        >
          {isSubmitting ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {/* Honeypot: off-screen and out of the tab order, so only a bot
          fills it. Not `display: none`, which some bots skip. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="newsletter-website">Website</label>
        <input
          id="newsletter-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div aria-live="polite">
        {error ? (
          <p id="newsletter-error" className="mt-stack-xs text-body-s text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
