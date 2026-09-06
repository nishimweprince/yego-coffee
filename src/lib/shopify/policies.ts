/**
 * Shopify policy sections.
 *
 * Policy bodies arrive as a single HTML string with `<strong>` runs
 * as section headings (e.g. the subscription policy's "Subscriptions",
 * "Pre-orders", "Try before you buy"). This splits them so pages can
 * excerpt the sections that apply to what the store actually sells and
 * link the full document — excerpting, never paraphrasing a document
 * customers rely on. Text before the first heading is returned with a
 * `null` heading; empty chunks are dropped.
 */
export type PolicySection = {
  heading: string | null;
  html: string;
};

function clean(html: string): string {
  return (
    html
      // Line breaks left behind by consumed headings.
      .replace(/^(?:\s*<br\s*\/?>)+/i, "")
      .replace(/(?:<br\s*\/?>\s*)+$/i, "")
      .trim()
  );
}

export function splitPolicySections(bodyHtml: string): PolicySection[] {
  const sections: PolicySection[] = [];
  const pattern = /<strong>(.*?)<\/strong>/gi;
  let lastIndex = 0;
  let heading: string | null = null;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(bodyHtml)) !== null) {
    const chunk = clean(bodyHtml.slice(lastIndex, match.index));
    if (chunk) sections.push({ heading, html: chunk });
    heading = match[1].replace(/<[^>]*>/g, "").trim() || null;
    lastIndex = match.index + match[0].length;
  }
  const tail = clean(bodyHtml.slice(lastIndex));
  if (tail) sections.push({ heading, html: tail });

  return sections;
}
