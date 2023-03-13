const { Schema, model } = require('mongoose')

const postSchema = new Schema({
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        require: [true, "Please provide creator id"]
    },
    content: {
        type: String,
        default: ""
    },
    media: [{
        type: String
    }],
    like: {
        type: Number,
        default: 0
    },
    vision: {
        type: String,
        enum: ['private', 'public', 'friend'],
        default: 'friend'
    },
    totalComment: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = model('posts', postSchema)