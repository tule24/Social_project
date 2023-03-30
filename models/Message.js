const { model, Schema } = require('mongoose')

const messageSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    lastMessage: {
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            require: [true, "Please provide creator id"]
        },
        content: {
            type: String,
            trim: true,
            default: "You are now connected! Send your first message!",
            minLength: [1, "Content length > 0"]
        }
    },
    messages: [
        {
            creatorId: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                require: [true, "Please provide creator id"]
            },
            content: [
                {
                    message: {
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
        }
    ]
}, { timestamps: true })

module.exports = model('messages', messageSchema)