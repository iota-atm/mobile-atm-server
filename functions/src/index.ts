import * as express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const app = express();
const bodyParser = require('body-parser');
const database = require("./database");

app.use(bodyParser.json({ type: 'application/json' }))
app.disable("x-powered-by");
admin.initializeApp();
// Get the Messaging service for the default app
var messaging = admin.messaging();


// Send money
app.post('/transactions', (req, res) => {
    const type        = req.body.type;
    const isSend      = type.toLowerCase() === "send";

    const title       = req.body.title;
    const description = req.body.description;
    const amount      = req.body.amount;
    const initiatorId = isSend ? req.body.initiatorId : req.body.receiverId;
    const receiverId  = isSend ? req.body.receiverId : req.body.initiatorId;
    const created     = req.body.created

    // Check request validity
    // TODO: Check validity using timestamp

    // database.getAccount(initiatorId)
    // .then((acc) => {
    //     console.log("Spending limit new: " + acc.spendingLimit)
    // })

    
    Promise.all([database.getAccountInfo(initiatorId), database.getAccountInfo(receiverId)])
    .then((results) => {
        console.log(results)
        // Load account information
        const initiatorAcc = results[0]
        const receiverAcc  = results[1]

        // Check for balance
        if (amount > initiatorAcc.balance){
            respondError("Not enough balance", res)
            return
        }

        // Check for spending limit
        if (initiatorAcc.spendingLimitEnable == true && amount > initiatorAcc.spendingLimit) {
            console.log("DIFF: " + (amount - initiatorAcc.spendingLimit))
            respondError("Amount is more than the spending limit.", res)
            return
        }

        
        // Execute the transaction
        database.executeTransaction( type, title, description, amount, initiatorId, receiverId, created)
        
        var msg = "Transaction completed";
        respondSuccess(msg, res)

        // TODO: Send push notification to both Initiator & Receiver
        sendPushNotification(msg, "qsp8g1byz5hs84xzDywfCtmc2P72")

    }).catch((err) => {
        console.log(err)
    })

});


// Success respond
function respondSuccess(msg, res) {
    res.status(200).send(JSON.stringify({ 
        status : "SUCCESS",
        message: msg,
        timestamp : new Date()
    }));
}

// Error respond
function respondError(msg, res){
    res.status(200).send(JSON.stringify({ 
        status : "FAILED",
        message: msg,
        timestamp : new Date() 
    }));
}

// Send push notification
function sendPushNotification(msg, uid){
    const topic = uid;

    const message = {
        data: {
            name: 'sdfsdf',
        },
        topic: 'qsp8g1byz5hs84xzDywfCtmc2P72'
    };

    // Send a message to devices subscribed to the provided topic.
    admin.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });
}


exports.route = functions.https.onRequest(app);
