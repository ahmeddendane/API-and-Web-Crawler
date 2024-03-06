import { FruitPage, PersonalPage } from '../models/index.js';

export const addPage = async (url, body, outgoingLinks) => {
    try {
        // console.log(body)
        const filter = { url };
        const update = { url, title: body.title, content: body.content, num: body.pageNum, rank:body.pageRank, wordFreq: body.words, outgoingLinks };
        const options = { new: true, upsert: true };
        const newPage = await FruitPage.findOneAndUpdate(filter, update, options);
        return newPage;
    } catch (error) {
        console.log("Error creating Page:", error);
        throw error;
    }
}

export const addPagePersonal = async (url, body, outgoingLinks, incomingLinks) => {
    try {
        // console.log(body)
        const filter = { url };
        const update = { url, title: body.title, content: body.content, num: body.num, rank:body.pageRank, wordFreq: body.wordFreq, outgoingLinks, incomingLinks };
        const options = { new: true, upsert: true };
        const newPage = await PersonalPage.findOneAndUpdate(filter, update, options);
        return newPage;
    } catch (error) {
        console.log("Error creating Page:", error);
        throw error;
    }
}

export const addIncomingLinks = async () => {
    try {
        for await (const page of FruitPage.find()) {
            for (const link of page.outgoingLinks) {
                const filter = { url: link };
                const update = { $addToSet: { incomingLinks: page.url } };
                const options = { new: true, upsert: true };
                const updatedPage = await FruitPage.findOneAndUpdate(filter, update, options);

                // console.log("\nUpdated the Incoming Links Array of:", link);
                // console.log("Incoming Links:", updatedPage.incomingLinks, "\nOutgoing Links:", updatedPage.outgoingLinks);
            }
        }
    } catch (error) {
        console.log(error);
    }
}