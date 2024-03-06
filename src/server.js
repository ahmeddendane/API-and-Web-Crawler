import express from "express";
import axios from 'axios';


import { connectToDatabase } from "./config/index.js";

const app = express();
const PORT = 3000;

app.set('views', '../views');
app.set("view engine", "pug");

import Router from './router.js';
app.use("/", Router);

const start = async () => {
    try {

        // axios.put('http://134.117.130.17:3000/searchengines',{request_url: 'http://134.117.135.62:3000'})
        //     .then((response) => {
        //         console.log(response.data);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        // });

        await connectToDatabase();

        console.log("\nStarting the server...")
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

start();