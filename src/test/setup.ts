import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-registers cleanup when Vitest globals are on.
// Without this, rendered trees accumulate in document.body and queries
// start matching elements from previous tests.
afterEach(cleanup);
