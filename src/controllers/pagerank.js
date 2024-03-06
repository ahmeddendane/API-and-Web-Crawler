import { Matrix } from 'ml-matrix';

// TODO: power iteration
// A7med refer to slides if you are confused to what i did
export const rank = async (request, response) => {
    try {
        const N = await request.page.find().countDocuments().lean().exec() // gets total number of pages
        // console.log("N:", N);
        let alpha = 0.1; // alpha value  try: 0.112
        let euclidean = 0.0001; // euclidean distance threshold
        let A = Matrix.zeros(N, N); // make the adjacency matrix
        let B = Matrix.ones(N, N); // use this later for adding alpha/N
        B = B.div(N)  // each entry is 1/N
        // console.log(B)
        

        let sortedPagesByNum = await request.page.find().sort({ 'num': 1 }).lean().exec() // need sorted pages by num (N-0, N-1 etc)
        // console.log(sortedPagesByNum)
        // console.log(sortedPagesByNum[0])
        
        await Promise.all(sortedPagesByNum.map(async (page, i) => { // for every page
            // console.log('page num:', page.num, 'title:', page.title)
            await Promise.all(page.outgoingLinks.map(async (link) => { // and for every link from the outgoing links
                let j = await request.page.find({ url: link }).lean().exec(); // this is just so i can get the num (ie. 0 from ...N-0.html)
                // console.log('j before:', j, 'url', link)
                // console.log('length j is 0', j)
                if(j.length != 0) {
                    j = j[0].num;
                    A = A.set(i, j, 1);
                }
                
                // console.log('j after:', j)

                 // set to 1 if page i links to page j => divide each 1 by the number of 1s in that row
                // console.log(A)
            }))
        }));

        // Iterate over each row of the matrix
        for (let i = 0; i < A.rows; i++) {
            // Count the number of 1s in the current row
            let countOnes = 0;
            for (let j = 0; j < A.columns; j++) {
            if (A.get(i, j) === 1) {
                countOnes++;
            }
            }
            
            // If there are 1s in the row, divide each 1 by the count of 1s
            if (countOnes > 0) {
            for (let j = 0; j < A.columns; j++) {
                if (A.get(i, j) === 1) {
                A.set(i, j, A.get(i, j) / countOnes);
                }
            }
            }
        }

        console.log('Adjacency Matrix A:')
        console.log(A) 
        // multiply by (1 - alpha)
        A = A.mul(1 - alpha);
        // console.log('1 - alpha * A', A)
        // multply by alpha
        B = B.mul(alpha)
        // console.log('alpha * 1/n', B)
        // add both together and we now have the transition probability matrix
        let P = Matrix.add(A, B);
        // console.log('after adding', P)

        let x0 = Matrix.zeros(1, N); // initial vector [1, 0, 0, ... n-1]
        x0 = x0.set(0, 0, 1);
        // console.log(x0)

        let prevx0;
        let flag;
        let i = 1;
        do {
            console.log('iteration #:', i)
            i = i + 1;
            prevx0 = x0
            // console.log('previous vector x0:', prevx0)
            x0 = x0.mmul(P)
            // console.log('current vector x0:', x0);
            // let difference = Math.abs(prevx0.norm() - x0.norm())
            let difference = distance(prevx0, x0);
            // console.log('prevx0.norm:', prevx0.norm(), 'x0.norm:', x0.norm())
            // console.log(prevx0.norm(), '-', x0.norm(), '=', difference)
            flag = difference >= euclidean
            // console.log(difference, '>=', euclidean, flag)
        } while (flag);
        console.log('Done: Values Converged')

        // console.log('\ntop 25 pagerank scores')
        // let sortedx0 = x0.sortRows( (a, b) => { return b - a })
        // console.log(sortedx0)

        let urlRankArray = [];

        const promises = [];


        for (let i = 0; i < x0.columns; i++) {
            const promise = await request.page.find({ 'num': i }).lean().exec()
            // console.log(promise[0].url)
            const url = promise[0].url;
            const rankScore = x0.get(0, i);
            await request.page.updateOne({url: promise[0].url}, {$set:{rank:rankScore}});

            // const test = await request.page.find({ 'num': i }).lean().exec()
            // console.log(test[0].rank);

            const urlRankPair = { "url": url, "rank": rankScore };
            urlRankArray.push(urlRankPair);
            promises.push(promise);
        }

        // let testarray = await request.page.find().exec();
        // console.log(testarray[0])

        await Promise.all(promises);

        let sortedUrlRankArray = urlRankArray.sort((a, b) => { return b.rank - a.rank });
        // console.log(sortedUrlRankArray)
        // console.log("Sorted Array",sortedUrlRankArray[0])


        response.status(200).json(sortedUrlRankArray);
    } catch (error) {
        console.log(error)
    }
}

const distance = function (u, v) {
    let sum = 0;
    let n = u.columns;
    for(let i = 0; i < n; i++) {
        let difference = u.get(0, i) - v.get(0, i)
        sum += Math.pow(difference, 2);
    }
    sum = Math.sqrt(sum)
    return sum;
}

// probably need to do a do while loop
// do : P mmul x0
// EXIT condition: while: difference b/w previous x0 and current x0 is >= euclidean
// use Matrix.norm to calculate vector norm 
// initial x0 => identity matrix? or [1, 0, 0, ... , n-1] == (Matrix.zeros(1, N) => set(0,0,1))