import mongoose, { Schema, SchemaType, SchemaTypes, model } from 'mongoose';

// const LinkSchema = new Schema({
//     source: { type: Schema.Types.ObjectId, ref: 'Page' },
//     target: { type: Schema.Types.ObjectId, ref: 'Page' }
// });

// const Link = model('Link', LinkSchema);

const fruitPageSchema = new Schema({
    url: String,
    title: String,
    content: String,
    num: Number,
    rank: Number,
    wordFreq: {},
    incomingLinks:  [String],
    outgoingLinks: [String],
    // incomingLinks: [{ type: Schema.Types.ObjectId, ref: 'Link'}],
    // outgoingLinks: [{ type: Schema.Types.ObjectId, ref: 'Link'}]
    // incomingLinks: [{ type: Schema.Types.ObjectId, ref: 'Page'}],
    // outgoingLinks: [{ type: Schema.Types.ObjectId, ref: 'Page'}] 
});

const personalPageSchema = new Schema({
    url: String,
    title: String,
    content: String,
    num: Number,
    rank: Number,
    wordFreq: {},
    incomingLinks: [String],
    outgoingLinks: [String],
});

export const FruitPage = model("FruitPage", fruitPageSchema, 'fruitPages');
export const PersonalPage = model("PersonalPage", personalPageSchema, 'personalPages');
