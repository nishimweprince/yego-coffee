/*
 * `ViewTransition` ships in the React canary that Next's App Router
 * bundles (see node_modules/next/dist/compiled/react), but its types
 * live behind `react/canary`. One reference here makes
 * `import { ViewTransition } from "react"` type-check everywhere.
 */
/// <reference types="react/canary" />
