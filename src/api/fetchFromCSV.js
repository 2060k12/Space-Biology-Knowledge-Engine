import fs from "fs";
import csv from "csv-parser";
import puppeteer from "puppeteer";

const inputCsv = "public/SB_publication_PMC.csv";
const outputJson = "public/abstracts_extended.json";

async function fetchSectionsPMC(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const data = await page.evaluate(() => {
    function getAbstract() {
      const headings = Array.from(document.querySelectorAll("h2, h3"));
      const h2 = headings.find((h) =>
        h.innerText.toLowerCase().includes("abstract")
      );
      if (h2) {
        const p = h2.nextElementSibling;
        if (p && p.tagName.toLowerCase() === "p") {
          return p.innerText.trim();
        }
      }
      return "";
    }

    function getSectionTextByHeadingKeywords(keywords = []) {
      const headings = Array.from(document.querySelectorAll("h2, h3, h4"));
      const heading = headings.find((h) =>
        keywords.some((k) =>
          h.innerText.toLowerCase().includes(k.toLowerCase())
        )
      );
      if (!heading) return "";
      let p = heading.nextElementSibling;
      let text = "";
      while (p && p.tagName.toLowerCase() === "p") {
        text += p.innerText + " ";
        p = p.nextElementSibling;
      }
      return text.trim();
    }

    // Get keywords
    function getKeywords() {
      const possible = [".keywords", ".kwd-group", "#keywords"];
      for (const sel of possible) {
        const el = document.querySelector(sel);
        if (el) return el.innerText.replace(/Keywords:/i, "").trim();
      }
      return "";
    }

    const abstract = getAbstract();
    const introduction = getSectionTextByHeadingKeywords([
      "introduction",
      "background",
    ]);
    const results = getSectionTextByHeadingKeywords([
      "results",
      "results and discussion",
      "findings",
    ]);
    const conclusion = getSectionTextByHeadingKeywords([
      "conclusion",
      "conclusions",
      "discussion",
    ]);
    const keywords = getKeywords();

    return { abstract, introduction, results, conclusion, keywords };
  });

  await browser.close();
  return data;
}

const rows = [];
fs.createReadStream(inputCsv, { encoding: "utf8" })
  .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
  .on("data", (row) => rows.push(row))
  .on("end", async () => {
    console.log("CSV read complete. Fetching sections...");

    const outputData = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const title = row["Title"]?.trim() || `Untitled ${i + 1}`;
      const link = row["Link"]?.trim();
      if (!link) {
        console.warn(`Skipping row ${i + 1} because Link is missing`);
        continue;
      }

      console.log(`Fetching (${i + 1}/${rows.length}): ${title}`);
      try {
        const sections = await fetchSectionsPMC(link);
        outputData.push({ title, link, ...sections });
      } catch (err) {
        console.warn(`Failed to fetch ${title}: ${err.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    fs.writeFileSync(outputJson, JSON.stringify(outputData, null, 2), "utf-8");
    console.log("Data saved as:", outputJson);
  });
