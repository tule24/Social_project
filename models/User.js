const { Schema, model } = require('mongoose')
const validator = require('validator')
const WAValidator = require('wallet-address-validator')

const userSchema = new Schema({
    wallet: {
        type: String,
        lowercase: true,
        unique: true,
        immutable: true,
        validate: {
            validator: function (val) {
                return WAValidator.validate(val, 'ETH', 'testnet')
            },
            message: "Only accept eth wallet"
        }
    },
    name: {
        type: String,
        require: [true, "Please provide your name"],
        minLength: [6, "Name length >= 6"],
        maxLength: [32, "Name length < 32"]
    },
    email: {
        type: String,
        require: [true, "Please provide your email"],
        validator: [validator.isEmail, "Invalid email"]
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    ava: String,
    phone: String,
    address: String,
    refreshToken: String
}, { timestamps: true })

module.exports = model('users', userSchema)