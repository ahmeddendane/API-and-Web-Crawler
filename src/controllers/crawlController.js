import { crawl, crawlPersonal } from '../services/index.js';

let crawlAccessed = false;
export const startCrawl = async (request, response) => {
    if (!crawlAccessed) {
        crawlAccessed = true;
        try {
            await crawl();
            response.status(200).send('Crawling done!');
        } catch (error) {
            console.log('Error during crawl:', error);
            response.status(500).send('Internal server error');
        }
    } else {
        console.log('Access to /crawl is forbidden! (Already crawled)');
        response.status(403).send('Access to /crawl is forbidden! (Already crawled)');
    }
}

let crawlAccessedPersonal = false;
export const startCrawlPersonal = async (request, response) => {
    if (!crawlAccessedPersonal) {
        crawlAccessedPersonal = true;
        try {
            await crawlPersonal();
            response.status(200).send('Crawling personal pages done!');
        } catch (error) {
            console.log('Error during crawl:', error);
            response.status(500).send('Internal server error');
        }
    } else {
        console.log('Access to /crawlPersonal is forbidden! (Already crawled)');
        response.status(403).send('Access to /crawlPersonal is forbidden! (Already crawled)');
    }
}

