import Crawler from 'crawler';
import { startTiming, printElapsedTime, wordFreq } from '../utils/index.js';
import { addPage, addIncomingLinks } from './PageService.js';

let startTime;

// const base = "https://people.scs.carleton.ca/~davidmckenney/tinyfruits/";
const base = "https://people.scs.carleton.ca/~davidmckenney/fruitgraph/";
const startUrl = base + "N-0.html";

const crawler = new Crawler({
    maxConnections: 10,
    skipDuplicates: true,
    callback: handleCrawledPage
});

crawler.on("schedule", (options) => {
    console.log("Added URL:", options.uri, "to the queue");
});

async function handleCrawledPage(error, response, done) {
    if (error) {
        console.log(error);
    } else {
        const $ = response.$;
        const title = $("title").text();
        const pageNum = $("title").text().slice(2);
        const pageRank = 0;
        const content = $("p").text().trim();
        const links = $("a");
        const currentUrl = response.options.uri;
        let outgoingLinks = [];

        let words = wordFreq(content);

        console.log("\nPopped from the queue:", currentUrl);

        $(links).each((index, link) => {
            const outgoingLink = (base + $(link).attr("href").slice(2));
            outgoingLinks.push(outgoingLink);
        });

        crawler.queue(outgoingLinks);

        try {
            const newPage = await addPage(currentUrl, {title, content, pageNum, pageRank, words}, outgoingLinks);
            // console.log("Outgoing links for:", newPage.url);
            // console.log(newPage.outgoingLinks);
        } catch (error) {
            console.log("Error creating Page:", error);
        }
    }
    done();
}

const crawl = async () => {
    return new Promise((resolve, reject) => {
        try {
            console.log("Starting the crawl from:", startUrl);
            startTime = startTiming();
            crawler.queue(startUrl);
            
            crawler.on("drain", async () => {
                console.log("\nDone crawling.");
                printElapsedTime(startTime, "Crawling");
            
                console.log("\nAdding Incoming Links...");
                startTime = startTiming();
                await addIncomingLinks();
                printElapsedTime(startTime, "addIncomingLinks()");
            
                resolve();  // Resolve the promise when crawling is completed
            });

        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
};

export default crawl;