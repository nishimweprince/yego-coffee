import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const routes = [
  ["home", "/"], ["shop", "/shop"], ["pdp", "/products/light-roast"],
  ["subs", "/subscriptions"], ["quiz", "/quiz"], ["about", "/about"],
  ["cafe", "/cafe"], ["journal", "/journal"], ["cart-empty", "/cart"],
  ["search", "/search?q=roast"], ["policies", "/policies"],
  ["account", "/account"], ["notfound", "/nope-404"], ["foundations", "/foundations"],
];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const [name, path] of routes) {
  try {
    await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle", timeout: 45000 });
    await p.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));} window.scrollTo(0,0); });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    const m = await p.evaluate(() => ({
      h: document.body.scrollHeight,
      h1: [...document.querySelectorAll("h1")].map(e=>e.textContent.trim()).join(" | ").slice(0,70),
      sections: document.querySelectorAll("main > section").length,
      surfaces: [...document.querySelectorAll("[data-surface]")].map(e=>e.dataset.surface).join(","),
    }));
    console.log(name.padEnd(12), String(m.h).padStart(5), "sec:"+String(m.sections).padStart(2), "| h1:", m.h1);
  } catch (e) { console.log(name.padEnd(12), "ERR", String(e.message).slice(0,60)); }
}
await b.close();
