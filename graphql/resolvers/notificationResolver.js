const { checkAuth } = require('../../helpers/authHelper')
const { catchAsync } = require('../../helpers/catchAsync')
const { PubSub, withFilter } = require('graphql-subscriptions')
const pubsub = new PubSub()

const notificationQuery = {
    getNotification: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.getNotification(user, args)
    })
}

const notificationResolver = {
    Notification: {
        from: catchAsync(async ({ fromId }, _, { userLoader }) => {
            const from = await userLoader.load(fromId.toString())
            return from
        })
    }
}

const notificationSubscription = {
    notificationCreated: {
        subscribe: withFilter(
            () => {
                return pubsub.asyncIterator('NOTIFICATION_CREATED')
            },
            (parent, _, { userId }) => {
                return parent.notificationCreated.userId.equals(userId)
            }
        )
    }
}

const pushNoti = (args) => {
    pubsub.publish('NOTIFICATION_CREATED', {
        notificationCreated: args
    })
}

module.exports = { notificationQuery, notificationSubscription, notificationResolver, pushNoti }