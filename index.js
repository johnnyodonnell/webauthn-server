const express = require("express");


const app = express();

app.use(express.static("public"));

app.get("/ping", (req, res) => {
    res.send("Success!");
});

app.listen(3000, () => {
    console.log("Started server...");
});

