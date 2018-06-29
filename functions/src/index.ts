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
        respondSuccess("Transaction successfull", res)

        // Send push notifications
        sendPushNotification("Money sent", `${amount}  send from your account` , initiatorId)
        sendPushNotification("Money received", `${amount} received from your account`, receiverId)

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
function sendPushNotification(messageTitle, messageBody, uid){

    // Message content
    const payload = {
        notification: {
            title: messageTitle,
            body: messageBody
        },
        data: {
            title: messageTitle,
            body: messageBody
        }
    }

    // Send to topic (uid)
    admin.messaging().sendToTopic(uid, payload)
    .then(function(response){
         console.log('Notification sent successfully:', response);
    }) 
    .catch(function(error){
         console.log('Notification sent failed:', error);
    });
}


exports.route = functions.https.onRequest(app);
