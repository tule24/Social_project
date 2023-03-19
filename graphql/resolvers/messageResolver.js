const catchAsync = require('../../helpers/catchAsync')
const { checkAuth } = require('../../helpers/authHelper')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const messageQuery = {
    getMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.getMessageRoom(user, args)
    })
}

const messageMutation = {
    createMessage: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.createMessage(user, args, pubsub)
    }),
    createMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.createMessageRoom(user, args)
    }),
    deleteMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.deleteMessageRoom(user, args)
    }),
    leaveMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.leaveMessageRoom(user, args)
    })
}

const messageSubscription = {
    messageCreated: {
        subscribe: () => pubsub.asyncIterator('MESSAGE_CREATED')
    }
}

const messageResolver = {
    Message: {
        user: catchAsync(async ({ creatorId }, _, { dbMethods, req }) => {
            return await dbMethods.getUserById(creatorId)
        })
    },
    MessageRoom: {
        users: catchAsync(async ({ users }, _, { dbMethods, req }) => {
            return dbMethods.getUserLike(users)
        })
    }
}

module.exports = { messageQuery, messageMutation, messageSubscription, messageResolver }