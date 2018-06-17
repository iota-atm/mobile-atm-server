import * as express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const app = express();
const database = require("./database");

app.disable("x-powered-by");
admin.initializeApp();


// Send money
app.get('/transactions', (req, res) => {
    const type        = req.query.type;
    const title       = req.query.title;
    const description = req.query.description;
    const amount      = req.query.amount;
    const initiatorId = req.query.initiatorId;
    const receiverId  = req.query.receiverId;
    const created     = req.query.created

    console.log(type + " " + title)

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
        } else {
            console.log("Transaction Not Completed")
            res.status(200).send("Transaction Not Completed")
        }
    })

});



exports.route = functions.https.onRequest(app);
