const {By, Key, Builder} = require("selenium-webdriver");
require("geckodriver");

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
        

    }
      
    driver.quit();
    
}

test_case();