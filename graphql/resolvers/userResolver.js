const catchAsync = require('../../helpers/catchAsync')
const userResolver = {
    Query: {
        users: catchAsync(async (_, __, { dbMethods, req }) => {
            return await dbMethods.getAllUser(req)
        }),
        user: catchAsync(async (_, { userId }, { dbMethods, req }) => {
            return await dbMethods.getUserById(req, userId)
        })
    },
    Mutation: {
        updateUser: catchAsync(async (_, { userInput }, { dbMethods, req }) => {
            return await dbMethods.updateUser(req, userInput)
        }),
        changePassword: catchAsync(async (_, { oldPassword, newPassword }, { dbMethods, req }) => {
            return await dbMethods.changePassword(req, oldPassword, newPassword)
        }),
        addFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
            return await dbMethods.handleAddFriend(req, friendId)
        }),
        confirmFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
            return await dbMethods.handleConfirmFriend(req, friendId)
        }),
        unFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
            return await dbMethods.handleUnFriend(req, friendId)
        }),
    },
    User: {
        friendList: catchAsync(async ({ id }, _, { dbMethods }) => {
            return await dbMethods.getFriends(id)
        }),
        // posts: ({ id }, _, { dbMethods }) => {
        //     return dbMethods.getPostsOfUser(id)
        // }
    }
}

module.exports = userResolver