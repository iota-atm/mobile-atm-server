import * as express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const app = express();
const bodyParser = require('body-parser');
const database = require("./database");

app.use(bodyParser.json({ type: 'application/json' }))
app.disable("x-powered-by");
admin.initializeApp();


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

    // Check for the balance before the transaction
    database.getBalance(initiatorId)
    .then((balance) => {
        console.log("balance: " + balance)
        console.log(balance - amount)

        if (amount < balance){
            // Execute the transaction
            database.executeTransaction( type, title, description, amount, initiatorId, receiverId, created)
            console.log("Transaction Completed")
            res.status(200).send("Transaction Completed")

            // TODO: Send push notification to both Initiator & Receiver
        } else {
            console.log("Not enough balance!")
            res.status(200).send("Not enough balance!")
        }
    })

});



exports.route = functions.https.onRequest(app);
