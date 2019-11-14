const express = require("express");
const uuid = require("uuid/v4");
const mustacheExpress = require("mustache-express");


const userId = "odjohnny";

const app = express();

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");

app.get("/", (req, res) => {
    const challenge = uuid();

    res.render("index.html.mustache", { userId, challenge, });
});

app.post("/register", (req, res) => {
});

app.listen(3000, () => {
    console.log("Started server...");
});

