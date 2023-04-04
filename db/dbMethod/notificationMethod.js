const Notification = require('../../models/Notification')

const notificationMethod = {
    getNotification: async (user, { page }) => {
        const notifications = await Notification.find({ userId: user._id }).sort('-createdAt').skip((page - 1) * 10).limit(10)
        return notifications
    }
}

module.exports = notificationMethod