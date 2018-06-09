import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { ENGINE_METHOD_PKEY_ASN1_METHS } from "constants";

// Get key by email
var getKey = function(email){
    return new Promise(async function(resolve, reject){
        var key = null
        await admin.database().ref("users").orderByChild("email").equalTo(email).once("value")
        .then((snapshot) => {
            snapshot.forEach(child => { key = child.key })
        }).catch(err => {
            reject(err)
        })

        if (key !== null){
            resolve(key)
        } else {
            reject("Email not found")
        }
    })
}

module.exports = {
    getKey: getKey,
}

