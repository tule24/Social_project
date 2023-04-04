const { checkAuth } = require('../../helpers/authHelper')
const { catchAsync } = require('../../helpers/catchAsync')
const { pushNoti } = require('../../graphql/resolvers/notificationResolver')

const userQuery = {
    users: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getAllUser(user, args)
    }),
    user: catchAsync(async (_, { userId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        const id = userId ? userId : user._id
        return await dbMethods.getUserById(id)
    }),
    friendOfUser: catchAsync(async (_, __, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getFriends(user._id)
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
        return await dbMethods.handleAddFriend(user, friendId, pushNoti)
    }),
    confirmFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleConfirmFriend(user, friendId, pushNoti)
    }),
    unFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleUnFriend(user, friendId)
    })
}

const userResolver = {
    User: {
        messageRoomOfUser: ({ messageRooms }, _, { dbMethods }) => {
            return dbMethods.getMessageOfUser(messageRooms)
        }
    }
}

module.exports = { userQuery, userMutation, userResolver }