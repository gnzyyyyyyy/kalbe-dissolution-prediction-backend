const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String
    },
    role: {
        type: String,
        enum: ['administrator', 'operator', 'nonActive'],
        default: 'nonActive'
    },
    password: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)