import functions from "firebase-functions";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import * as dotenv from "dotenv";

import { Console } from "./Console.js";

dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
import twilio from "twilio";
const client = twilio(accountSid, authToken);

async function getPageData(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
      },
    });
    const body = await response.text();
    return body;
  } catch (error) {
    console.log(error);
  }
}
async function getProductLinks() {
  const url =
    "https://www.gamestop.com/consoles-hardware?prefn1=platform&prefv1=Nintendo%203DS%7CNintendo%202DS";
  const data = await getPageData(url);
  const $ = cheerio.load(data);
  const productLinks = [];

  $("a.product-tile-link").each((i, el) => {
    productLinks.push($(el).attr("href"));
  });
  return productLinks;
}

async function checkProductAvailability() {
  const products = await getProductLinks();
  const productList = await Promise.all(
    products.map(async (product, index) => {
      const productData = await getPageData(
        `https://www.gamestop.com${product}`
      );
      const $ = cheerio.load(productData);
      return new Console(
        $("title:first").text(),
        $("button.bg-primary span:first").text(),
        `https://www.gamestop.com${product}`
      );
    })
  );
  const availableProductList = productList.filter((product) =>
    product.availability.toLowerCase().includes("add to cart")
  );
  return availableProductList;
}

async function formatResults() {
  let body = "";
  const availableItems = await checkProductAvailability();
  const mostWantedItems = availableItems.filter((item) =>
    item.title.toLowerCase().includes("new")
  );
  const otherItems = availableItems.filter((item) => {
    return !item.title.toLowerCase().includes("new");
  });
  if (mostWantedItems.length !== 0) {
    body += "These New 3ds Devices are currently available: \n";
    for (let item of mostWantedItems) {
      body += `-${item}\n`;
    }
  } else {
    body += "No New 3ds Devices are available. \n";
  }
  if (otherItems.length !== 0) {
    body += "These other 3ds devices are available: \n";
    for (let item of otherItems) {
      body += `-${item}\n`;
    }
  }
  return body;
}
async function sendMessage() {
  const output = await formatResults();
  if (output !== "") {
    try {
      const message = await client.messages.create({
        to: process.env.MY_PHONE_NUMBER,
        messagingServiceSid: "MGf6a5607f116aee10573b7a227c05c629",
        body: output,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
sendMessage();
export const scheduleSendMessage = functions.pubsub
  .schedule("*/15 9-21 * * *")
  .timeZone("America/New_York") // Users can choose timezone - default is America/Los_Angeles
  .onRun((context) => {
    console.log("This will be run every day at 11:05 AM Eastern!");
    return null;
  });
