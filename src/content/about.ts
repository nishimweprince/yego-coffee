/**
 * The owners' About copy, verbatim from yegocoffee.com/pages/about-us
 * (read 2026-11-16).
 *
 * This is the text the live store shows. It lives in the old theme's
 * section settings, not in a Shopify page body, so the Storefront API
 * cannot read it: the `who-are-we` page body is a different, older
 * draft that the live site never displays. That is why it is kept
 * here rather than fetched.
 *
 * Do not edit the wording. Only the HTML source's stray whitespace
 * (a double space and a hard line break mid-sentence) is normalised;
 * the theme's `<br><br>` marks the paragraph break. §71: the owners'
 * account of their own family is not something to improve on.
 */
export const ABOUT = {
  heading: "About Yego Coffee",
  paragraphs: [
    "Yego Coffee is a family owned company based in Somerville, Massachusetts by Fatuma and her husband Francois Tuyishime. The word YEGO is from Kinyarwanda and it means YES. The word can be seen as a simple word, but this means a lot to Mr. Tuyishime. This word in Rwanda is a symbol of positivity and affirmation. The positivity that allowed us to overcome the darkness we passed through in 1994 during the genocide against the Tutsi. It is that mindset of positivity that allowed our family and communities to restore our hope where there was nothing left.",
    "Coffee business has been part of Tuyishime's family for over four decades. As a boy he grew up seeing his father in coffee farms working alongside the farmers providing a sustainable income for his family. He instilled this same drive into his son to not only use coffee for income, but also as a tool to build and support communities.",
  ],
} as const;
