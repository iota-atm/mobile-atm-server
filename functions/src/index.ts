import * as express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const app = express();
// app.disable("x-powered-by");
admin.initializeApp();

var errHander = function(err){
    console.log(err)
}

const database = require("./database");

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

    // Check for the balance
    database.getBalance(initiatorId)
    .then((a) => {
        console.log("balance: " + a)
        res.status(200).send(a)
    })

});


exports.route = functions.https.onRequest(app);
