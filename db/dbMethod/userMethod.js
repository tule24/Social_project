const User = require('../../models/User')
const GraphError = require('../../errors')
const { checkPassword } = require('../../helpers/authHelper')

const userMethod = {
    getUserById: async (userId) => {
        const user = await User.findById(userId)
        if (!user) {
            throw GraphError("User not found", "NOT_FOUND")
        }
        return user
    },
    getUserLike: async (like) => {
        if (like) {
            const friends = await User.find({ _id: { $in: [...like] } })
            return friends
        }
        return []
    },
    getFriends: async (friends) => {
        const friendList = await User.find({ _id: { $in: [...friends] } })
        return friendList
    },
    getAllUser: async () => {
        const users = await User.find()
        return users
    },
    updateUser: async ({ _id }, userInput) => {
        if (userInput.password) {
            throw GraphError(
                "This router isn't used to update password",
                "BAD_REQUEST"
            )
        }
        const userUpdate = await User.findByIdAndUpdate(_id, userInput, { new: true, runValidators: true })
        if (!userUpdate) {
            throw GraphError(
                "User not found",
                "NOT_FOUND"
            )
        }
        return userUpdate
    },
    changePassword: async ({ _id }, oldPassword, newPassword) => {
        if (!newPassword || !oldPassword) {
            throw GraphError(
                "Please provide new & old password",
                "BAD_REQUEST"
            )
        }
        const user = await User.findById(_id)
        const checkPass = await checkPassword(oldPassword, user.password)
        if (!checkPass) {
            throw GraphError('Pasword not match. Please re-check password', 'UNAUTHORIZED')
        }

        user.password = newPassword
        user.passwordChangedAt = Date.now()
        await user.save()
    },
    handleAddFriend: async ({ _id }, friendId) => {
        if (!friendId) {
            throw GraphError(
                "Please provide friend id",
                "BAD_REQUEST"
            )
        }
        const user = await User.findById(_id)
        if (user.friendsRequest.includes(friendId)) {
            throw GraphError(
                "Friendrequest is exist",
                "BAD_REQUEST"
            )
        }
        user.friendsRequest.push(_id)
        await user.save()
    },
    handleUnFriend: async ({ _id }, friendId) => {
        if (!friendId) {
            throw GraphError(
                "Please provide friend id",
                "BAD_REQUEST"
            )
        }

        const user = await User.findById(_id)

        const oldLen = user.friends.length
        user.friends = user.friends.filter(el => el !== friendId)

        if (oldLen === user.friends.length) {
            throw GraphError(
                "Friend not found",
                "BAD_REQUEST"
            )
        }
        await user.save()
    },
    handleConfirmFriend: async ({ _id }, friendId) => {
        if (!friendId) {
            throw GraphError(
                "Please provide friend id",
                "BAD_REQUEST"
            )
        }

        const user = await User.findById(_id)
        const oldLen = user.friendsRequest.length
        user.friendsRequest = user.friendsRequest.filter(el => el !== friendId)
        if (oldLen === user.friendsRequest.length) {
            throw GraphError(
                "Friendrequest not exist",
                "BAD_REQUEST"
            )
        }

        if (user.friends.includes(friendId)) {
            throw GraphError(
                "Friend is exist",
                "BAD_REQUEST"
            )
        }
        user.friends.push(friendId)
        await user.save()
    }
}

module.exports = userMethod