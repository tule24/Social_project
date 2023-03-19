const { model, Schema } = require('mongoose')

const messageSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    messages: [
        {
            creatorId: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                require: [true, "Please provide creator id"]
            },
            content: {
                type: String,
                trim: true,
                require: [true, "Please provide content"],
                minLength: [1, "Content length > 0"]
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true })

module.exports = model('messages', messageSchema)