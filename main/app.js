const {By, Key, Builder} = require("selenium-webdriver");
require("geckodriver");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid,authToken);

async function test_case(){

    let driver = await new Builder().forBrowser("firefox").build();

    await driver.get("https://www.gamestop.com/consoles-hardware?prefn1=platform&prefv1=Nintendo%203DS|Nintendo%202DS&start=0&sz=36")
    let links_href = []
    let links =  await driver.findElements(By.className("product-tile-link"));
    for(let i=0;i<links.length;i++){
        links_href[i] = links[i].getAttribute("href");

    }

    for(let item of links_href){
        await driver.get(item);
        console.log(item);
        let button = await driver.findElement(By.css("div.my-6:nth-child(1) > button:nth-child(1) > span:nth-child(1)"))
        let title = await driver.findElement(By.css("h2.text-xl")).getAttribute("textContent");
        let available= await button.getAttribute("textContent");
        if( available=="Add to Cart"){
            console.log(title);
        }

    }
      
    driver.quit();
    
}

test_case();