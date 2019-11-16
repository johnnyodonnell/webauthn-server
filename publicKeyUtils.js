// Taken from:
// https://github.com/fido-alliance/webauthn-demo/blob/completed-demo/utils.js
const cbor = require("cbor");


let ASN1toPEM = (pkBuffer) => {
    if (!Buffer.isBuffer(pkBuffer))
        throw new Error("ASN1toPEM: pkBuffer must be Buffer.")

    let type;
    if (pkBuffer.length == 65 && pkBuffer[0] == 0x04) {
        pkBuffer = Buffer.concat([
            new Buffer.from(
                "3059301306072a8648ce3d020106082a8648ce3d030107034200", "hex"),
            pkBuffer
        ]);

        type = 'PUBLIC KEY';
    } else {
        type = 'CERTIFICATE';
    }

    let b64cert = pkBuffer.toString('base64');

    let PEMKey = '';
    for(let i = 0; i < Math.ceil(b64cert.length / 64); i++) {
        let start = 64 * i;

        PEMKey += b64cert.substr(start, 64) + '\n';
    }

    PEMKey = `-----BEGIN ${type}-----\n` + PEMKey + `-----END ${type}-----\n`;

    return PEMKey
}

let COSEECDHAtoPKCS = (COSEPublicKey) => {
    let coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
    let tag = Buffer.from([0x04]);
    let x   = coseStruct.get(-2);
    let y   = coseStruct.get(-3);

    return Buffer.concat([tag, x, y])
}

module.exports = { ASN1toPEM, COSEECDHAtoPKCS };

