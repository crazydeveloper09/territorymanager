const mongoose = require("mongoose");

const territorySchema = new mongoose.Schema({
    city: String,
    street: String,
    lastWorked: String,
    number: Number,
    beginNumber: Number,
    endNumber: Number,
    kind: String,
    preacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Congregation"
    },
    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Checkout"
    }],
    type: String,
    taken: String,
    description: String,
    forbidden: String
});

module.exports = mongoose.model("Territory", territorySchema);