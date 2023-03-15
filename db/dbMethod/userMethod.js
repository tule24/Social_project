const User = require('../../models/User')
const GraphError = require('../../errors')
const { checkPassword, checkAuth } = require('../../helpers/authHelper')
const { updateId, addId, checkFound } = require('../../helpers/userHelper')

const userMethod = {
    getUserById: async (req, userId) => {
        await checkAuth(req)
        const user = await checkFound(userId)
        return user
    },
    getUserLike: async (like) => {
        if (like) {
            const friends = await User.find({ _id: { $in: [...like] } })
            return friends
        }
        return []
    },
    getFriends: async (userId) => {
        const { friends } = await User.findById(userId).select('friends').populate({ path: "friends.userId", select: "_id name email ava" })
        const formatFriends = friends.map(el => {
            return { ...el.userId._doc, status: el.status }
        })
        return formatFriends
    },
    getAllUser: async (req) => {
        await checkAuth(req)
        const users = await User.find()
        return {
            totalUser: users.length,
            users
        }
    },
    updateUser: async (req, userInput) => {
        const user = await checkAuth(req)
        if (userInput.password) {
            throw GraphError(
                "This router isn't used to update password",
                "BAD_REQUEST"
            )
        }
        const newUser = await User.findByIdAndUpdate(user._id, userInput, { new: true, runValidators: true })
        return newUser
    },
    changePassword: async (req, oldPassword, newPassword) => {
        const user = await checkAuth(req)
        if (!newPassword || !oldPassword) {
            throw GraphError(
                "Please provide new & old password",
                "BAD_REQUEST"
            )
        }
        const checkPass = await checkPassword(oldPassword, user.password)
        if (!checkPass) {
            throw GraphError('Pasword not match. Please re-check password', 'UNAUTHORIZED')
        }

        user.password = newPassword
        user.passwordChangedAt = Date.now()
        await user.save()
        return user
    },
    handleAddFriend: async (req, friendId) => {
        const user = await checkAuth(req)
        const friend = await checkFound(friendId)

        friend.friends = addId(friend.friends, user._id, 'request')
        user.friends = addId(user.friends, friendId, 'waiting')

        await user.save()
        await friend.save()
        return {
            code: "OK",
            message: "Send add friend request success"
        }
    },
    handleConfirmFriend: async (req, friendId) => {
        const user = await checkAuth(req)
        const friend = await checkFound(friendId)

        user.friends = updateId(user.friends, friendId, 'confirm')
        friend.friends = updateId(friend.friends, user._id, 'confirm')

        await user.save()
        await friend.save()

        return {
            code: "OK",
            message: "Confirm add friend success"
        }
    },
    handleUnFriend: async (req, friendId) => {
        const user = await checkAuth(req)
        const friend = await checkFound(friendId)

        user.friends = removeId(user.friends, friendId)
        friend.friends = removeId(friend.friends, user._id)

        await user.save()
        await friend.save()

        return {
            code: "OK",
            message: "Unfriend success"
        }
    },
}

module.exports = userMethod