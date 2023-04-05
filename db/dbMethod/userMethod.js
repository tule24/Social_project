const User = require('../../models/User')
const Message = require('../../models/Message')
const Notification = require('../../models/Notification')
const GraphError = require('../../errors')
const { checkPassword } = require('../../helpers/authHelper')
const { pagination, checkFound, removeId, updateId, addId } = require('../../helpers/methodHelper')
const uploadImage = require('./uploadImage')

const userMethod = {
    // handle query
    getUserById: async (userId) => {
        const user = await checkFound(userId, User)
        console.log(`Calling getUserById for id: ${userId}`)
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
            return { ...el.userId._doc, id: el.userId._doc._id, status: el.status }
        })
        return formatFriends
    },
    getAllUser: async (user, args) => {
        const friendIds = user.friends.map(el => el.userId)
        const { limit, skip } = pagination(args)
        const users = await User.find({ _id: { $nin: [...friendIds, user._id] } }).skip(skip).limit(limit)
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

        let newUser
        if (userInput.ava) {
            const ava = await uploadImage(userInput.ava)
            newUser = await User.findByIdAndUpdate(user._id, { ava }, { new: true, runValidators: true })
        } else {
            newUser = await User.findByIdAndUpdate(user._id, userInput, { new: true, runValidators: true })
        }
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
    handleAddFriend: async (user, friendId, pushNoti) => {
        const friend = await checkFound(friendId, User)

        friend.friends = addId(friend.friends, user._id, 'request')
        user.friends = addId(user.friends, friendId, 'waiting')

        await user.save()
        await friend.save()

        const noti = new Notification({
            userId: friendId,
            fromId: user._id,
            option: 'addfriend',
            contentId: user._id,
            content: `sent you a friend request`
        })

        await noti.save()
        pushNoti({
            id: noti._id,
            userId: noti.userId,
            fromId: noti.fromId,
            option: noti.option,
            contentId: noti.contentId,
            content: noti.content
        })

        return {
            id: friend._id,
            name: friend.name,
            ava: friend.ava,
            status: 'waiting'
        }
    },
    handleConfirmFriend: async (user, friendId, pushNoti) => {
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

        const noti = new Notification({
            userId: friendId,
            fromId: user._id,
            option: 'confirmfriend',
            contentId: user._id,
            content: `confirmed your request`
        })

        await noti.save()
        pushNoti({
            id: noti._id,
            userId: noti.userId,
            fromId: noti.fromId,
            option: noti.option,
            contentId: noti.contentId,
            content: noti.content
        })

        return {
            id: friend._id,
            name: friend.name,
            ava: friend.ava,
            status: 'confirm'
        }
    },
    handleUnFriend: async (user, friendId) => {
        const friend = await checkFound(friendId, User)

        user.friends = removeId(user.friends, friendId)
        friend.friends = removeId(friend.friends, user._id)

        await user.save()
        await friend.save()

        pushNoti({
            id: 'unfriend',
            userId: friendId,
            fromId: user._id,
            option: 'unfriend',
            contentId: user._id,
            content: 'unfriend'
        })

        return {
            id: friend._id,
            name: friend.name,
            ava: friend.ava
        }
    },
}

module.exports = userMethod