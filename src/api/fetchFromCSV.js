import fs from "fs";
import csv from "csv-parser";
import puppeteer from "puppeteer";

// Input CSV and output JSON
const inputCsv = "public/SB_publication_PMC.csv";
const outputJson = "public/abstracts.json";

// Function to fetch abstract from PMC HTML page
async function fetchAbstractPMC(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const abstract = await page.evaluate(() => {
    const anchor = document.querySelector("#abstract1-anchor");
    if (!anchor) return "";
    let p = anchor.parentElement.nextElementSibling;
    let text = "";
    while (p && p.tagName.toLowerCase() === "p") {
      text += p.innerText + " ";
      p = p.nextElementSibling;
    }
    return text.trim();
  });

  await browser.close();
  return abstract;
}

// Read CSV and process
const results = [];
fs.createReadStream(inputCsv, { encoding: "utf8" })
  .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
  .on("data", (row) => results.push(row))
  .on("end", async () => {
    console.log("CSV read complete. Fetching abstracts...");

    const outputData = [];

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const title = row["Title"]?.trim() || `Untitled ${i + 1}`;
      const link = row["Link"]?.trim();
      if (!link) {
        console.warn(`Skipping row ${i + 1} because Link is missing`);
        continue;
      }

      console.log(`Fetching (${i + 1}/${results.length}): ${title}`);
      const abstract = await fetchAbstractPMC(link);

      outputData.push({ title, link, abstract });

      // NCBI rate limit (~3 requests/sec)
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    // Write JSON file at the end
    fs.writeFileSync(outputJson, JSON.stringify(outputData, null, 2), "utf-8");
    console.log("Done! JSON saved as:", outputJson);
  });
