import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { ENGINE_METHOD_PKEY_ASN1_METHS } from "constants";

// Get key by email
const getKey = function(email){
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

// Get balance
var getBalance = function(uid){
    return new Promise(async function(resolve, reject){
        await admin.database().ref("/users/" + uid + "/account").once('value')
        .then((snapshot) => {
            const acc = JSON.parse(JSON.stringify(snapshot))
            resolve(acc.balance)
        }).catch(err => {
            reject(err)
        })
    })
}

// Add log entry


module.exports = {
    getKey: getKey,
    getBalance: getBalance
}

