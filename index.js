const express = require("express");
const uuid = require("uuid/v4");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");


const userId = "odjohnny";

const registrationRequests = {};
const registeredKeys = {};

const app = express();

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");

app.use(bodyParser.json());

app.get("/", (req, res) => {
    const challenge = uuid();

    registrationRequests[userId] = challenge;

    res.render("index.html.mustache", { userId, challenge, });
});

app.post("/register", (req, res) => {
    const credential = req.body;
    console.log(credential);

    res.json(true);
});

app.listen(3000, () => {
    console.log("Started server...");
});

