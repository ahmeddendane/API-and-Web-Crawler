import { CheerioCrawler } from "crawlee";
import robotsParser from 'robots-parser';
import fetch from 'node-fetch';
import { addPagePersonal } from './PageService.js';
// import { connectToDatabase } from '../config/index.js';
import { wordFreq } from "../utils/wordFreq.js";

const seedURL = 'https://pokemon.fandom.com/wiki/Pikachu';
let processedPages = 0;
let linkMap = new Map();

const robotsUrl = 'https://pokemon.fandom.com/robots.txt';
let robots;

// fetch and parse the robots.txt file
async function loadRobotsTxt() {
    const response = await fetch(robotsUrl);
    const robotsTxtContent = await response.text();
    robots = robotsParser(robotsUrl, robotsTxtContent);
}

const crawler = new CheerioCrawler({
    maxConcurrency: 10,
    maxRequestsPerCrawl: 900,
    requestHandler: async ({ $, request, enqueueLinks }) => {
        const url = request.url;
        const fullTitle = $('title').text();
        const title = fullTitle.split(' | ')[0];
        const pageRank = 0;
        const contentTag = 'main.page__main';

        // let content = $(contentTag).text();
        let content = '';
        $(contentTag).find('b, i, p, h1, h2, h3, h4, h5, h6, a, th, td, span, li').each((index, element) => {
            // get the text content of each element and add it to content
            content += $(element).text() + ' ';
        });
        // console.log(content);
        
        console.log(`Processing page ${processedPages+1}: ${url} - Title: ${title}`);

        // process incoming and outgoing links
        let linkInfo = { num: processedPages, incomingLinks: new Set(), outgoingLinks: new Set() };
        linkInfo.content = content.trim();

        let words = wordFreq(content);
        linkInfo.wordFreq = words;

        linkInfo.pageRank = pageRank;
        linkInfo.title = title;

        // console.log(words);

        if (!linkMap.has(url)) {
            linkMap.set(url, linkInfo);
        } else {
            linkInfo = linkMap.get(url);
        }

        const mainContentSelector = contentTag + ' a';
        const links = $(mainContentSelector);
        $(links).each((index, link) => {
            const href = $(link).attr('href');
            if (href) {
                try {
                    const nextUrl = new URL(href, url);
                    const absoluteHref = nextUrl.href;
                    if (
                        robots.isAllowed(absoluteHref) && 
                        absoluteHref.startsWith('https://pokemon.fandom.com/wiki/') &&
                        !absoluteHref.startsWith('https://pokemon.fandom.com/wiki/File') &&
                        !absoluteHref.includes('#')
                    ) {
                        linkInfo.outgoingLinks.add(absoluteHref);
                        // console.log('Outgoing Link:', absoluteHref, 'of:', url);
                        if (!linkMap.has(absoluteHref)) {
                            linkMap.set(absoluteHref, { incomingLinks: new Set(), outgoingLinks: new Set() });
                        }
                        linkMap.get(absoluteHref).incomingLinks.add(url);
                    }
                } catch (error) {
                    console.log(`Error resolving URL for href '${href}' with base '${url}':`, error);
                }
            }
        });

        if (linkMap.has(url) && !linkMap.get(url).hasOwnProperty('num')) {
            // Add num only when the page gets processed
            linkMap.get(url).num = processedPages;
            linkMap.get(url).title = title;
            linkMap.get(url).content = content;
            linkMap.get(url).wordFreq = words;
            linkMap.get(url).pageRank = pageRank;

        }

        processedPages++;

        await enqueueLinks({
            selector: mainContentSelector,
            regexps: [/^https:\/\/pokemon\.fandom\.com\/wiki\//i],
            transformRequestFunction: (enqueuedRequest) => {
                try {
                    const enqueuedUrl = new URL(enqueuedRequest.url);
                    if (
                        robots.isAllowed(enqueuedRequest.url) && 
                        !enqueuedUrl.pathname.startsWith('/wiki/File') &&
                        !enqueuedUrl.pathname.startsWith('/wiki/Category')
                    ) {
                        return enqueuedRequest;
                    }
                    return false;
                } catch (error) {
                   console.log(`Error processing URL '${enqueuedRequest.url}': ${error}`);
                   return false; 
                }
            } 
        });
    }
});

async function runCrawler() {
    // await connectToDatabase();
    await loadRobotsTxt();
    await crawler.run([seedURL]);

    for (const [url, linkInfo] of linkMap.entries()) {
        if (!linkInfo.hasOwnProperty('num')) {
            linkMap.delete(url);
        }
    }
    // console.log(linkMap);

    // add pages here

    const addPagePromises = [];
    for (const [url, linkInfo] of linkMap.entries()) {
        // Destructure linkInfo object to get the necessary fields
        const { title, content, num, pageRank, wordFreq, outgoingLinks, incomingLinks } = linkInfo;
        // Convert outgoingLinks Set and incomingLinks Set to an Array
        const outgoingLinksArray = Array.from(outgoingLinks);
        const incomingLinksArray = Array.from(incomingLinks);

        // Call addPage for each processed page
        // Store promises in an array
        addPagePromises.push(addPagePersonal(url, { title, content, num, pageRank, wordFreq }, outgoingLinksArray, incomingLinksArray));
    }

    try {
        await Promise.all(addPagePromises);
        console.log('All pages have been added to the database.');
    } catch (error) {
        console.error('An error occurred while adding pages to the database:', error);
    }
}

// runCrawler()
//     .then(() => console.log(`Crawler finished. Processed ${processedPages} pages.`))
//     .catch((error) => console.log('Crawler finished with an error:', error));

const crawlPersonal = async () => {
    runCrawler()
    .then(() => console.log(`Crawler finished. Processed ${processedPages} pages.`))
    .catch((error) => console.log('Crawler finished with an error:', error));
}

export default crawlPersonal;