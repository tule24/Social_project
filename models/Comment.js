const { Schema, model } = require('mongoose')

const commentSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'posts'
    },
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    content: {
        type: String,
        trim: true,
        require: [true, "Please provide content"],
        minLength: [1, "Content length > 0"]
    },
    media: [{
        type: String
    }],
    like: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    replies: [
        {
            creatorId: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            content: {
                type: String,
                trim: true,
                require: [true, "Please provide content"],
                minLength: [1, "Content length > 0"]
            },
            media: [{
                type: String
            }],
            like: [{
                type: Schema.Types.ObjectId,
                ref: 'users'
            }],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true })

module.exports = model('comments', commentSchema)