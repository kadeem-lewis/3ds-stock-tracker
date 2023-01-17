//import functions from "firebase-functions";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

import { Console } from "./Console.js";

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
  let productObject = {};
  const productList = products.map(async (product, index) => {
    const productData = await getPageData(`https://www.gamestop.com${product}`);
    const $ = cheerio.load(productData);
    const productName = `product${index + 1}`;
    productObject[productName] = new Console(
      $("title:first").text(),
      $("button.bg-primary span:first").text(),
      `https://www.gamestop.com${product}`
    );

    console.log(productObject[productName]);
  });
  const availableProductList = productList.filter(
    (product) => product.availability === "Currently Unavailable" //change back to Add to Cart after testing
  );
  return availableProductList;
}
async function formatResults() {
  const availableItems = await checkProductAvailability();
  const mostWantedItems = availableItems.filter(
    (item) => item.title.search(/New/) //* Figure out way to do this currently
  );
  console.log(mostWantedItems);
}
//TODO: Twilio Stuff
formatResults();
// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
