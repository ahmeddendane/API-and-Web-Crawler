import { connect } from 'mongoose';

const server = '127.0.0.1:27017';
// const database = 'crawler';
const database = 'personal'
let db;

export const connectToDatabase = async () => {
    try {
        db = (await connect(`mongodb://${server}/${database}`, { useNewUrlParser: true , useUnifiedTopology: true })).connection;

        db.on('error', (error) => {
            console.error('Mongoose connection error:', error);
        });

        console.log("Database connection successfully established!");
    } catch (error) {
        console.log("Database connection failed!", error);
    }
}

export const getDatabase = () => db;