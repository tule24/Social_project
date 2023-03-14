const { Schema, model } = require('mongoose')
const validator = require('validator')
// const WAValidator = require('wallet-address-validator')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
    // wallet: {
    //     type: String,
    //     lowercase: true,
    //     unique: true,
    //     immutable: true,
    //     validate: {
    //         validator: function (val) {
    //             return WAValidator.validate(val, 'ETH', 'testnet')
    //         },
    //         message: "Only accept eth wallet"
    //     }
    // },
    name: {
        type: String,
        require: [true, "Please provide your name"],
        minLength: [6, "Name length >= 6"],
        maxLength: [32, "Name length < 32"]
    },
    password: {
        type: String,
        require: [true, "Please provide password"]
    },
    email: {
        type: String,
        require: [true, "Please provide your email"],
        validate: {
            validator: function (val) {
                return validator.default.isEmail(val)
            },
            message: "Email invalid"
        }
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

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
    next()
})
module.exports = model('users', userSchema)