const express = require("express");
const uuid = require("uuid/v4");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const cbor = require("cbor");
const { encode } = require("base64-arraybuffer");
const crypto = require("crypto");

const publicKeyUtils = require("./publicKeyUtils");


const userId = "odjohnny";

const challenges = {};
const registeredKeys = {};

const app = express();

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");

app.use(bodyParser.json());

app.get("/", (req, res) => {
    const challenge = uuid();
    challenges[userId] = challenge;

    const credentialId =
        registeredKeys[userId] && registeredKeys[userId].credentialId;

    res.render("index.html.mustache", { userId, challenge, credentialId });
});

app.post("/register", (req, res) => {
    const credential = req.body;

    const decodedClientData = JSON.parse(
        Buffer.from(credential.response.clientDataJSON, "base64").toString());
    const decodedChallenge =
        Buffer.from(decodedClientData.challenge, "base64").toString();

    if (challenges[userId] && (challenges[userId] === decodedChallenge)) {
        cbor.decodeFirst(
            Buffer.from(credential.response.attestationObject, "base64"),
            (err, res) => {
                const authData = res.authData;

                const credentialIdLength =
                    (authData[53] << 8) + authData[54];
                const credentialId =
                    authData.slice(55, 55 + credentialIdLength);
                const publicKeyBytes = authData.slice(55 + credentialIdLength);

                registeredKeys[userId] = {
                    credentialId: encode(credentialId),
                    publicKeyBytes:
                        publicKeyUtils.COSEECDHAtoPKCS(publicKeyBytes),
                };
            });

        return res.json(true);
    }

    res.json(false);
});

app.post("/authenticate", (req, res) => {
    const credential = req.body;
    const credentialId = credential.rawId;

    const authData =
        Buffer.from(credential.response.authenticatorData, "base64");
    const signatureBuffer =
        Buffer.from(credential.response.signature, "base64");
    const decodedClientDataString =
        Buffer.from(credential.response.clientDataJSON, "base64").toString();
    const decodedClientData = JSON.parse(decodedClientDataString);
    const decodedChallenge =
        Buffer.from(decodedClientData.challenge, "base64").toString();

    const hash =
        crypto.createHash("SHA256").update(decodedClientDataString).digest();
    const data = Buffer.concat([authData, hash]);

    if (challenges[userId] && (challenges[userId] === decodedChallenge)
            && registeredKeys[userId]
            && crypto.createVerify("SHA256").update(data)
                     .verify(publicKeyUtils.ASN1toPEM(
                                registeredKeys[userId].publicKeyBytes),
                             signatureBuffer)) {
        return res.json(true);
    }

    res.json(false);
});

app.listen(3000, () => {
    console.log("Started server...");
});

