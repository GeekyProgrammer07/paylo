import express from 'express';
import dotenv from 'dotenv'
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.get("/", (_,res) => {
    res.send("Hey there");
})

app.post("/createTransfer", (_,res) => {
    res.send("Hello");
})

// app.post("hdfcWebhook", (req,res) => {

// })

app.listen(3002, () => {
    console.log("App is listening on 3002");
});