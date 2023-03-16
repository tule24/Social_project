const catchAsync = require('../../helpers/catchAsync')
const { checkAuth } = require('../../helpers/authHelper')

const userQuery = {
    users: catchAsync(async (_, __, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getAllUser(user)
    }),
    user: catchAsync(async (_, { userId }, { dbMethods, req }) => {
        await checkAuth(req)
        return await dbMethods.getUserById(userId)
    })
}

const userMutation = {
    updateUser: catchAsync(async (_, { userInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateUser(user, userInput)
    }),
    changePassword: catchAsync(async (_, { oldPassword, newPassword }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.changePassword(user, oldPassword, newPassword)
    }),
    addFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleAddFriend(user, friendId)
    }),
    confirmFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleConfirmFriend(user, friendId)
    }),
    unFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleUnFriend(user, friendId)
    })
}

const userResolver = {
    User: {
        friendList: catchAsync(async ({ id }, _, { dbMethods }) => {
            return await dbMethods.getFriends(id)
        }),
        postsOfUser: ({ id }, _, { dbMethods }) => {
            return dbMethods.getPostsOfUser(id)
        },
        postsForUser: (async (user, _, { dbMethods }) => {
            return await dbMethods.getPostsForUser(user)
        })
    }
}

module.exports = { userQuery, userMutation, userResolver }