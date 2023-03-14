const { checkAuth } = require('../../helpers/authHelper')
const userResolver = {
    // Query: {
    //     users: async (_, __, { dbMethods, req }) => {
    //         try {
    //             await checkAuth(req)
    //             const users = await dbMethods.getAllUser()
    //             return users
    //         } catch (error) {
    //             return error
    //         }
    //     },
    //     user: async (_, { id }, { dbMethods, req }) => {
    //         try {
    //             await checkAuth(req)
    //             const user = await dbMethods.getUserById(id)
    //             return user
    //         } catch (error) {
    //             return error
    //         }
    //     }
    // },
    // Mutation: {
    //     updateUser: async (_, { userInput }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             const userUpdate = await dbMethods.updateUser(user, userInput)
    //             return {
    //                 code: 'OK',
    //                 success: true,
    //                 message: 'Update user success',
    //                 user: userUpdate
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message,
    //                 user: null
    //             }
    //         }
    //     },
    //     changePassword: async (_, { oldPassword, newPassword }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             await dbMethods.changePassword(user, oldPassword, newPassword)
    //             return {
    //                 code: 'OK',
    //                 success: true,
    //                 message: 'Update password success'
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message
    //             }
    //         }
    //     },
    //     addFriend: async (_, { friendId }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             await dbMethods.handleAddFriend(user, friendId)
    //             return {
    //                 code: 'OK',
    //                 success: true,
    //                 message: 'Add friend success',
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message
    //             }
    //         }
    //     },
    //     confirmFriend: async (_, { friendId }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             await dbMethods.handleConfirmFriend(user, friendId)
    //             return {
    //                 code: 'OK',
    //                 success: true,
    //                 message: 'Confirm add friend success',
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message
    //             }
    //         }
    //     },
    //     unFriend: async (_, { friendId }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             await dbMethods.handleUnFriend(user, friendId)
    //             return {
    //                 code: 'OK',
    //                 success: true,
    //                 message: 'Unfriend success',
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message
    //             }
    //         }
    //     },
    // },
    // User: {
    //     friendRequestList: ({ friendsRequest }, _, { dbMethods }) => {
    //         return dbMethods.getFriends(friendsRequest)
    //     },
    //     friendList: ({ friends }, _, { dbMethods }) => {
    //         return dbMethods.getFriends(friends)
    //     },
    //     posts: ({ id }, _, { dbMethods }) => {
    //         return dbMethods.getPostsOfUser(id)
    //     }
    // }
}

module.exports = userResolver