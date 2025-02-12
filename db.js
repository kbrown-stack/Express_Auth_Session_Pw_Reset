// This file help connect by holding the code that is ruuning the database to the application


const mongoose = require('mongoose');  // first import mongoose 
require("dotenv").config()

const MONGO_DB_CONNECTION_URL = process.env.MONGO_DB_CONNECTION_URL

// Connecting to the Mongodb Database 

function connectToMongoDB() {
    mongoose.connect(MONGO_DB_CONNECTION_URL);

    mongoose.connection.on("connected", () => {
        console.log("Connected successully to Mongodb")
    })

    mongoose.connection.on("error",(err) => {
        console.log(err)
        console.log("An Error occured while starting the mongo DB.")
    } )



}

module.exports = { connectToMongoDB };
