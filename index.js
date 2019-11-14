const express = require("express");


const app = express();

app.get("/", (req, res) => {
    res.send("Success!");
});

app.listen(3000, () => {
    console.log("Started server...");
});

