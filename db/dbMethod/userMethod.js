const User = require('../../models/User')
const Message = require('../../models/Message')
const GraphError = require('../../errors')
const { checkPassword } = require('../../helpers/authHelper')
const { updateId, addId, checkFound, removeId } = require('../../helpers/methodHelper')

const userMethod = {
    // handle query
    getUserById: async (userId) => {
        const user = await checkFound(userId, User)
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
        const { friends } = await User.findById(userId).select('friends').populate({ path: "friends.userId", select: "_id name ava" })
        const formatFriends = friends.map(el => {
            return { ...el.userId._doc, status: el.status }
        })
        return formatFriends
    },
    getAllUser: async (user) => {
        const friendIds = user.friends.map(el => el.userId)
        const users = await User.find({ _id: { $nin: [...friendIds] } })
        return users
    },
    // handle mutation
    updateUser: async (user, userInput) => {
        if (userInput.password) {
            throw GraphError(
                "This router isn't used to update password",
                "BAD_REQUEST"
            )
        }
        const newUser = await User.findByIdAndUpdate(user._id, userInput, { new: true, runValidators: true })
        return newUser
    },
    changePassword: async (user, oldPassword, newPassword) => {
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
    handleAddFriend: async (user, friendId) => {
        const friend = await checkFound(friendId, User)

        friend.friends = addId(friend.friends, user._id, 'request')
        user.friends = addId(user.friends, friendId, 'waiting')

        await user.save()
        await friend.save()
        return user
    },
    handleConfirmFriend: async (user, friendId) => {
        const friend = await checkFound(friendId, User)

        user.friends = updateId(user.friends, friendId, 'confirm')
        friend.friends = updateId(friend.friends, user._id, 'confirm')

        const newMessageRoom = new Message({
            users: [user._id, friendId],
            messages: []
        })
        await newMessageRoom.save()

        user.messageRooms.push(newMessageRoom._id)
        friend.messageRooms.push(newMessageRoom._id)
        await user.save()
        await friend.save()

        return user
    },
    handleUnFriend: async (user, friendId) => {
        const friend = await checkFound(friendId, User)

        user.friends = removeId(user.friends, friendId)
        friend.friends = removeId(friend.friends, user._id)

        await user.save()
        await friend.save()

        return user
    },
}

module.exports = userMethod