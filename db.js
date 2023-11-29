// import mongoose
const mongoose = require('mongoose');

// connect to database
mongoose.connect('mongodb://127.0.0.1:27017/amanDB');

// create schema
const userSchema = mongoose.Schema({
    name: String,
    age: Number,
    email: String
});

const authSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const testSchema = mongoose.Schema({
    username: String,
    nickname: String,
    description: String,
    categories: {
        type: Array,
        default: []
    },
    datacreated: {
        type: Date,
        default: Date.now()
    }
});

// create model using the schema
const userModel = mongoose.model('users', userSchema);
const testModel = mongoose.model('test', testSchema);
const authModel = mongoose.model("auth", authSchema)

// export the users model
module.exports = {userModel, testModel, authModel};