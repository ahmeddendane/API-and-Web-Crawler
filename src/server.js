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