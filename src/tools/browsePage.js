import axios from "axios";
import * as cheerio from "cheerio";
import { chromium } from "playwright";

let browser;

// Launch browser once (important for performance)
const initBrowser = async () => {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
};

// graceful shutdown (REGISTER ONCE)
const closeBrowser = async () => {
  if (browser) {
    await browser.close();
    browser = null;
  }
};

process.on("exit", closeBrowser);
process.on("SIGINT", closeBrowser);
process.on("SIGTERM", closeBrowser);

export const browsePage = async (url) => {

  // ---------- FAST PATH (SSR) ----------
  try {
    const response = await axios.get(url, { timeout: 5000 });

    const $ = cheerio.load(response.data);

    $("script, style, noscript").remove();

    const text = $("body").text()
      .replace(/\s+/g, " ")
      .trim();

    // Detect low-quality SSR content
    if (text.length > 1000) {
      return text.slice(0, 8000);
    }

  } catch (err) {
    // ignore and fallback
  }

  // ---------- FALLBACK (CSR) ----------
  try {
    const browserInstance = await initBrowser();
    const context = await browserInstance.newContext();
    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 10000
    });

    const content = await page.evaluate(() => {
      document.querySelectorAll("script,style,noscript")
        .forEach(el => el.remove());
      return document.body.innerText;
    });

    await context.close();
    

    return content.replace(/\s+/g, " ").trim().slice(0, 8000);

    

  } catch (err) {
    return "Failed to extract page content.";
  }
};