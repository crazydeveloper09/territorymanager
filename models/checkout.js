const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now()
    },
    record: Object
})

module.exports = mongoose.model("Checkout", checkoutSchema)