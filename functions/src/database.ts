import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { ENGINE_METHOD_PKEY_ASN1_METHS } from "constants";

// Get key by email
const getKey = function(email){
    return new Promise(async function(resolve, reject){
        let key = null
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
const getBalance = function(uid){
    return new Promise(async function(resolve, reject){
        const accountRef = admin.database().ref("/users/" + uid + "/account")
        await accountRef.once('value')
        .then((snapshot) => {
            const acc = JSON.parse(JSON.stringify(snapshot))
            resolve(parseInt(acc.balance))
        }).catch(err => {
            reject(err)
        })
    })
}

// Get spending limit
const getSpendingLimit = function(uid){
    return new Promise(async function(resolve, reject){
        const accountRef = admin.database().ref("/users/" + uid + "/account")
        await accountRef.once('value')
        .then((snapshot) => {
            const acc = JSON.parse(JSON.stringify(snapshot))
            resolve(parseInt(acc.spendingLimit))
        }).catch(err => {
            reject(err)
        })
    })
}

// Get Account
const getAccountInfo = function(uid){
    return new Promise(async function(resolve, reject){
        const accountRef = admin.database().ref("/users/" + uid + "/account")
        await accountRef.once('value')
        .then((snapshot) => {
            const acc = JSON.parse(JSON.stringify(snapshot))
            resolve(acc)
        }).catch(err => {
            reject(err)
        })
    })
}

// Add log entry
const executeTransaction = function(type, title, description, amount:number, initiatorId, receiverId, created){
    return new Promise(async function(resolve, reject){
        const initiatorRef = admin.database().ref("/users/" + initiatorId)
        const receiverRef  = admin.database().ref("/users/" + receiverId)

        // Update balance of the initiator
        getBalance(initiatorId)
        .then((balance) => {
            const newBalance = (parseInt(balance.toString()) - parseInt(amount.toString()))
            initiatorRef.child("account").child('balance').set(newBalance)
            .then(() => {
                console.log("Updated initiator's balance")
            })
            .catch(err => {
                console.log(err)
            });
        })
        .then(()=> {
            // Balance updated
        })
        .catch(err => {
            console.log(err)
        })

        // Update balance of the recieve
        getBalance(receiverId)
        .then((balance) => {
            const newBalance = (parseInt(balance.toString()) + parseInt(amount.toString()))
            receiverRef.child("account").child('balance').set(newBalance)
            .then(() => {
                console.log("Updated receiver's balance")
            })
            .catch(err => {
                console.log(err)
            });
        })
        .then(()=> {
            // Balance updated
        })
        .catch(err => {
            console.log(err)
        })


        // Update initiator's log
        initiatorRef.child('log').push({
            "type" : "SEND",
            "title" : title,
            "description" : description,
            "amount" : amount,
            "receiverId" : receiverId,
            "created" : created
        })

        // Update receiver's log
        receiverRef.child('log').push({
            "type" : "RECEIVE",
            "title" : title,
            "description" : description,
            "amount" : amount,
            "initiatorId" : initiatorId,
            "created" : created
        })

        resolve("Transaction Complete")

    })
}

module.exports = {
    getKey: getKey,
    getBalance: getBalance,
    executeTransaction: executeTransaction,
    getSpendingLimit: getSpendingLimit,
    getAccountInfo: getAccountInfo
}

