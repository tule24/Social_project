const { Schema, model } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
    name: {
        type: String,
        require: [true, "Please provide your name"],
        trim: true,
        minLength: [3, "Name length >= 3"],
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
    dob: {
        type: Date,
        default: Date.now
    },
    ava: String,
    phone: String,
    address: String,
    friends: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            status: {
                type: String,
                require: [true, 'Please provide status friend'],
                enum: ['waiting', 'request', 'confirm']
            }
        }
    ],
    messageRooms: [
        {
            type: Schema.Types.ObjectId,
            ref: 'messages'
        }
    ],
    refreshToken: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
    next()
})
module.exports = model('users', userSchema)