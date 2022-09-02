const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const congregationSchema = new mongoose.Schema({
    username: String,
    password: String,
    territoryServantEmail: String,
    ministryOverseerEmail: String,
    verificationNumber: Number,
    verificationExpires: Date,
    verificated: {
        type: Boolean,
        default: false
    },
    territories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Territory"
        }
    ],
    preachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Preacher"
        }
    ]
})
congregationSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Congregation", congregationSchema);