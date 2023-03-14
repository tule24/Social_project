const { checkAuth } = require('../../helpers/authHelper')
const catchAsync = require('../../helpers/catchAsync')
const userResolver = {
    Query: {
        users: catchAsync(async (_, __, { dbMethods, req }) => {
            await checkAuth(req)
            return await dbMethods.getAllUser()
        }),
        user: catchAsync(async (_, { id }, { dbMethods, req }) => {
            await checkAuth(req)
            return await dbMethods.getUserById(id)
        })
    },
    Mutation: {
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
        }),
    },
    User: {
        friendRequestList: catchAsync(async ({ friendsRequest }, _, { dbMethods }) => {
            return await dbMethods.getFriends(friendsRequest)
        }),
        friendList: catchAsync(async ({ friends }, _, { dbMethods }) => {
            return await dbMethods.getFriends(friends)
        }),
        // posts: ({ id }, _, { dbMethods }) => {
        //     return dbMethods.getPostsOfUser(id)
        // }
    }
}

module.exports = userResolver