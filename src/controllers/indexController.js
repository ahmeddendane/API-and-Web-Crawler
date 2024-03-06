import elasticlunr from "elasticlunr";
import { FruitPage, PersonalPage } from "../models/index.js";

export const fruitIndex = elasticlunr( function () {
    this.addField('title');
    this.addField('content');
    this.saveDocument(true);
    this.setRef('_id');
});

export const personalIndex = elasticlunr( function () {
    this.addField('title');
    this.addField('content');
    this.saveDocument(true);
    this.setRef('_id');
});


export const startIndex = async function (request, response) {
    try {
        const result = await request.page.find().lean();

        result.forEach( (page, i) => {
            // console.log(page);
            request.index.addDoc(page);
            // console.log(i)
            // console.log(index.toJSON())
            
        });

        // console.log(index.search('apple', {}))

        // console.log(JSON.stringify(index));
        // console.log(index.toJSON().documentStore.docs)
        // console.log(index.toJSON().documentStore.docInfo)

        response.status(200).send(JSON.stringify(request.index))
    } catch (error) {
        console.log(error)
    }
}

// export const startIndexPersonal = async function (request, response) {
//     try {
//         const result = await PersonalPage.find().lean();

//         result.forEach( (page, i) => {
//             personalIndex.addDoc(page);
//         });
//         response.status(200).send(JSON.stringify(personalIndex))
//     } catch (error) {
//         console.log(error)
//     }
// }

export const search = async function (request, response) {
    console.log(request.query)

    console.log(`Querying for ${request.query.q}:`);
    // console.log(index);

    const search_results=request.index.search(request.query.q, {
        fields:{
            content: {expand: true}
        }
    });

    let top_10=[];

    let responseArray=[];
    // try slicing next time maybe?
    if(1 <= request.query.limit && 50 >= request.query.limit){
        console.log('withing query limit?', (1 <= request.query.limit && 50 >= request.query.limit))
        if(request.query.boost && request.query.boost=='true'){
            top_10 = await applySearchBasedOnLimit(request.index, request.page, search_results,request.query.limit,true, top_10, responseArray);
        }
        else{
            top_10 = await applySearchBasedOnLimit(request.index, request.page, search_results,request.query.limit,false, top_10, responseArray)
        }
    }
    else{
        console.log("TEST2")
        if(request.query.boost && request.query.boost=='true'){
            
            top_10 = await applySearchBasedOnLimit(request.index, request.page, search_results,10,true, top_10, responseArray)
        }
        else{
            top_10 = await applySearchBasedOnLimit(request.index, request.page, search_results,10,false, top_10, responseArray)
        }
    }



    response.format({
        "text/html": () => { response.status(200).render("pages/search",{top_10:top_10[0], route: request.search}); },
        "application/json": () => { response.status(200).json(top_10[1]); }
    });
}

async function applySearchBasedOnLimit(index, page, search_results,Limit,boost, top10Array){
    let array = []  

    let objects = []

    let response = []

    if(boost==true){

        const resultData = await fetchAndProcessPageData(search_results, page);
        console.log(resultData)


        
        if(resultData.length>=Limit){ // limit to 10 results (if more than 10 matches)
            for(let x=0; x<Limit; x++){
                let pageObject = {"page":resultData[x].pageData,"score":resultData[x].scoreRank}

                let responseObject = {}
                responseObject.name = "Ghufran Wadud, Ahmed Samir Dendane";
                responseObject.url = resultData[x].pageData.url;
                responseObject.score = resultData[x].scoreRank;
                responseObject.title = resultData[x].pageData.title;
                responseObject.pr = resultData[x].pageData.rank;
                response.push(responseObject);
                objects.push(pageObject);
            
            }
        } else {
            const remainder = Limit - search_results.length;
            let excludedIds = []
    
            for (let i = 0; i < search_results.length; i++) {
                excludedIds.push(resultData[i].pageData.ref)
                let pageObject = {"page":resultData[i].pageData,"score":resultData[i].scoreRank}

                let responseObject = {}
                responseObject.name = "Ghufran Wadud, Ahmed Samir Dendane";
                responseObject.url = resultData[i].pageData.url;
                responseObject.score = resultData[i].scoreRank;
                responseObject.title = resultData[i].pageData.title;
                responseObject.pr = resultData[i].pageData.rank;
                response.push(responseObject); 
                objects.push(pageObject);
            }
    
            let filler = await page.find({ _id: { $nin: excludedIds }}).limit(remainder)
            // console.log(filler)
    
            for (let i = 0; i < filler.length; i++) {
                let pageObject = {"page":filler[i],"score":0}

                // console.log(filler[i])
                let responseObject = {}
                responseObject.name = "Ghufran Wadud, Ahmed Samir Dendane";
                responseObject.url = filler[i].url;
                responseObject.score = 0;
                responseObject.title = filler[i].title;
                responseObject.pr = filler[i].rank;
                response.push(responseObject);
                objects.push(pageObject);
            }
        }
    }
    else{

        console.log(search_results.length)

        if(search_results.length>=Limit){ // limit to 10 results (if more than 10 matches)
            for(let x=0; x<Limit; x++){
                let result = await page.findById(search_results[x].ref)
                let pageObject = {"page":result,"score":search_results[x].score}



                let responseObject = {}
                responseObject.name = "Ghufran Wadud, Ahmed Samir Dendane";
                responseObject.url = result.url;
                responseObject.score = search_results[x].score;
                responseObject.title = result.title;
                responseObject.pr = result.rank;
                response.push(responseObject);
                objects.push(pageObject);
            
            }
        } else {
            const remainder = Limit - search_results.length;
            let excludedIds = []
    
            for (let i = 0; i < search_results.length; i++) {
                excludedIds.push(search_results[i].ref)
                let result = await page.findById(search_results[i].ref)

                let pageObject = {"page":result,"score":search_results[i].score}



                let responseObject = {}
                responseObject.name = "Ghufran Wadud, Ahmed Samir Dendane";
                responseObject.url = result.url;
                responseObject.score = search_results[i].score;
                responseObject.title = result.title;
                responseObject.pr = result.rank;
                response.push(responseObject);  
                objects.push(pageObject);
            }
    
            let filler = await page.find({ _id: { $nin: excludedIds }}).limit(remainder)
            // console.log(filler)
    
            for (let i = 0; i < filler.length; i++) {
                let pageObject = {"page":filler[i],"score":0}

            
                // console.log(filler[i])
                let responseObject = {}
                responseObject.name = "Ghufran Wadud, Ahmed Samir Dendane";
                responseObject.url = filler[i].url;
                responseObject.score = 0;
                responseObject.title = filler[i].title;
                responseObject.pr = filler[i].rank;
                response.push(responseObject);
                objects.push(pageObject);
            } 
        }
    }

    console.log(objects[0])

    return [objects,response]
}

async function fetchAndProcessPageData(search_results, page) {
    const refValues = search_results.map(result => result.ref);
    
    // Fetch pageData for all relevant refs in one query
    const pageDataMap = new Map();
    const pageData = await page.find({ _id: { $in: refValues } }).select('rank title url');

  
    for (const data of pageData) {
      pageDataMap.set(data._id.toString(), data);
    }
  
    // Calculate scoreRank for each result
    const resultData = search_results.map(result => ({
      result,
      pageData: pageDataMap.get(result.ref.toString()),
      scoreRank: result.score * pageDataMap.get(result.ref.toString()).rank,
    }));
  
    // Sort the search results by the score multiplied by the rank
    resultData.sort((a, b) => b.scoreRank - a.scoreRank);
  
    return resultData;
  }
  

