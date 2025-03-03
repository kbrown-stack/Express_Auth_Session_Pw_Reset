// This file is for the user schema 

const { default: mongoose } = require('mongoose');
const moogoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userModel = new mongoose.Schema({
    username: String,
    password:String,
    email: String
})

// This Automatically handles hashing and selling of passwords 
//and adds the following properties to the user object: 
// - password
// - salt
// - hash

userModel.plugin(passportLocalMongoose)

module.exports = mongoose.model('users', userModel)