const mongoose = require("mongoose");
const dbgr = require("debug")("development: mongoose");
const config = require("config");


mongoose.connect(`${config.get("MONGODB_URI")}/eproject`)
.then(() => {
    dbgr("Database connected successfully");
})
.catch((err) => {
    dbgr("Error connecting to database: ", err);
})

module.exports = mongoose.connection;