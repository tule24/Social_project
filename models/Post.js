const { Schema, model } = require('mongoose')

const postSchema = new Schema({
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
    media: [{
        type: String
    }],
    like: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    vision: {
        type: String,
        enum: ['private', 'public', 'friend'],
        default: 'friend'
    },
    totalLike: {
        type: Number,
        default: 0
    },
    totalComment: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = model('posts', postSchema)