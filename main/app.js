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
    let inStockTitles = []
    let inStockLinks = []

    for(let item of links_href){
        await driver.get(item);
        let button = await driver.findElement(By.css("div.my-6:nth-child(1) > button:nth-child(1) > span:nth-child(1)"))
        let title = await driver.findElement(By.css("h2.text-xl")).getAttribute("textContent");
        let available= await button.getAttribute("textContent");
        
        
        if( available=="Currently Unavailable"){
            inStockTitles.push(title);
            inStockLinks.push(item);
        }

    }
    for(let inStockTitle in inStockTitles){
        console.log(inStockTitle);
    }
    let output = "These items are currently available:\n"
    for(let j=0;j>inStockTitles.length;j++){
        output.concat(inStockTitles[j],": ",inStockLinks[j],"\n");
    }
    console.log(output)
 
    client.messages.create({
        to: process.env.MY_PHONE_NUMBER,
        from: "+15625544270",
        body: output 
    })
      
    driver.quit();
    
}

test_case();