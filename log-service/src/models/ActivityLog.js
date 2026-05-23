const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    action: String,
    description: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    doneBy: String,
    role: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);