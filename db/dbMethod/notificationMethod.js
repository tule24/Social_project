const Notification = require('../../models/Notification')
const { pagination } = require('../../helpers/methodHelper')

const notificationMethod = {
    getNotification: async (user, args) => {
        const { limit, skip } = pagination(args)
        const notifications = await Notification.find({ userId: user._id }).sort('-createdAt').skip(skip).limit(limit)
        return notifications
    }
}

module.exports = notificationMethod