import express from 'express';
import mongoose from 'mongoose'
// import { startTiming, printElapsedTime } from './utils/index.js'
import { FruitPage, PersonalPage } from './models/PageModel.js'
import { startCrawl, startCrawlPersonal, startIndex, fruitIndex, personalIndex, search, rank } from "./controllers/index.js"
const router = express.Router();

router.get("/", getIndex);

router.use((request, response, next) => {
    request.page = request.path.split("/")[1] === "fruits" ? FruitPage : PersonalPage;
    request.index = request.path.split("/")[1] === "fruits" ? fruitIndex : personalIndex;
    request.search = request.path.split("/")[1] === "fruits" ? "fruits" : "personal";
    next();
});

router.get("/crawl", startCrawl);
router.get("/crawlPersonal", startCrawlPersonal);

router.get('/fruits/index', startIndex);
router.get('/personal/index', startIndex);

router.get('/fruits/rank', rank)
router.get('/personal/rank', rank)

router.get("/fruits/popular", getPopular);
router.get("/personal/popular", getPopular);

router.get('/fruits', search);
router.get('/personal', search);

router.get("/fruits/:id", getPage);
router.get("/personal/:id", getPage);

function getIndex(request, response) {
    response.render("pages/index");
}

async function getPage(request, response){
    try {
        let id = request.params.id;
	    console.log('ID from request params:', id);
        try {
            id = new mongoose.Types.ObjectId(id);
        } catch (err) {
            response.status(404).send("ID " + id + " does not exist.");
            return;
        }

        const page = await request.page.findById(id).exec();

        if (page == undefined) {
            response.status(409).send("Cannot Find Page");
        } else {
            response.format({
                "text/html": () => { response.status(200).render("pages/page", {page: page}); },
                "application/json": () => {
                    response.status(200).json(page);
                }
            });
        }

        
    } catch(error) {
        console.log("Cannot Find Page: ", error);
        response.status(409).send("Cannot Find Page");
    } 
}

async function getPopular(request,response){
    try{

    const result = await request.page.find();

    // console.log(result[0].id);

    const array = []

    result.forEach(function(page){
        
        let new_page={"id":"","url":"","numberoflinks":0};
        new_page.id=page.id;
        new_page.title=page.title;
        new_page.url=page.url;
        new_page.numberoflinks=page.incomingLinks.length;

        array.push(new_page);

    })

    let sortedarray=array.sort(function(a, b){return b.numberoflinks - a.numberoflinks});

    console.log('GET POPULAR', request.url);

    response.format({
        "text/html": () => { response.status(200).render("pages/popular",{sortedarray: sortedarray.slice(0,10), route: request.search}); },
        "application/json": () => {
            response.status(200).json(request.sortedarray.slice(0,10));
          }
      });

    }
    catch(error){
        console.log("Cannot get popular: ", error);
        response.status(409).send("Cannot get popular");
    }
    
}

export default router;