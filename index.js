#!/usr/bin/env node

const axios = require("axios");
const puppeteer = require("puppeteer");

const argv = process.argv.slice(2);

main(...argv);

async function main(limit = 0, screenshotType = "png") {
  console.log(limit, screenshotType);
  const breaches = await getBreaches(limit);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1600,
    height: 1200,
    deviceScaleFactor: 1
  });

  for (const { Name } of breaches) {
    const breachUrl = `https://fx-breach-alerts.herokuapp.com/breach-details/${Name}`;
    const breachPath = `./shots/${Name}.${screenshotType}`;
    console.log(`Fetching ${breachUrl} (${breachPath})`);
    await page.goto(breachUrl, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: breachPath,
      type: screenshotType,
      clip: {
        x: 0,
        y: 0,
        width: page.viewport().width,
        height: 3200
      }

      /* Oddly, `fullPage` is cropping off the footer, so set an explicit clip region above and best-guess(tm) the final viewport height. */
      // fullPage: true,
    });
  }

  await browser.close();
}

async function getBreaches(limit = 0) {
  const res = await axios.get("https://monitor.firefox.com/hibp/breaches");
  if (limit > 0) {
    return res.data.slice(0, limit);
  }
  return res.data;
}
