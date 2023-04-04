const { model, Schema } = require('mongoose')

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        require: [true, "Please provide to user id"],
    },
    fromId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        require: [true, "Please provide from id"],
    },
    option: {
        type: String,
        require: [true, "Please provide option"],
    },
    contentId: Schema.Types.ObjectId,
    content: {
        type: String,
        trim: true,
        require: [true, "Please provide content"],
        minLength: [1, "Content length > 0"]
    }
}, { timestamps: true })

module.exports = model('notifications', notificationSchema)