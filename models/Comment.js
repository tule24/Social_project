const { Schema, model } = require('mongoose')

const commentSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'posts',
        require: [true, "Please provide post id"]
    },
    comments: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            content: {
                type: String,
                require: [true, "Please provide comment content"]
            },
            media: [{
                type: String
            }],
            createdAt: {
                type: Number,
                default: new Date.now()
            },
            like: [{
                type: Schema.Types.ObjectId,
                ref: 'users'
            }],
            childComments: [
                {
                    userId: {
                        type: Schema.Types.ObjectId,
                        ref: 'users'
                    },
                    content: {
                        type: String,
                        require: [true, "Please provide comment content"]
                    },
                    media: [{
                        type: String
                    }],
                    createdAt: {
                        type: Number,
                        default: new Date.now()
                    },
                    like: [{
                        type: Schema.Types.ObjectId,
                        ref: 'users'
                    }]
                }
            ]
        }
    ]
})

module.exports = model('comments', commentSchema)