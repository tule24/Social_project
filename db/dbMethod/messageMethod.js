const Message = require('../../models/Message')
const User = require('../../models/User')
const GraphError = require('../../errors')
const { checkFound } = require('../../helpers/methodHelper')

const messageMethod = {
    // query
    getMessageRoom: async (user, { roomId }) => {
        const messageRoom = await checkFound(roomId, Message)
        const checkInRoom = messageRoom.users.find(user._id)
        if (!checkInRoom) {
            throw GraphError(
                "You don't have permission to access this room",
                "UNAUTHORIZED"
            )
        }

        return messageRoom
    },
    getMessageOfUser: async (messageRooms) => {
        const messageRoomsArr = await Message.find({ _id: { $in: messageRooms } })
        return messageRoomsArr
    },
    //mutation
    createMessage: async (user, { roomId, content }, pubsub) => {
        const messageRoom = await checkFound(roomId, Message)

        const checkInRoom = messageRoom.users.find(el => el.equals(user._id))
        if (!checkInRoom) {
            throw GraphError(
                "You don't have permission to access this room",
                "UNAUTHORIZED"
            )
        }

        const message = {
            creatorId: user._id,
            content,
            createdAt: Date.now()
        }

        messageRoom.messages.push(message)
        await messageRoom.save()

        pubsub.publish('MESSAGE_CREATED', {
            messageCreated: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    ava: user.ava,
                    phone: user.phone,
                    address: user.address
                },
                content,
                createdAt: Date.now()
            }
        })
        return message
    },
    createMessageRoom: async (user, { users }) => {
        const newMessageRoom = new Message({
            users,
            messages: []
        })
        await newMessageRoom.save()

        await Promise.all(users.map(async (el) => {
            const user = await User.findById(el)
            user.messageRooms.push(newMessageRoom._id)
            return await user.save()
        }))
        return newMessageRoom
    },
    deleteMessageRoom: async (user, { roomId }) => {
        const messageRoom = await Message.findByIdAndDelete(roomId)
        if (!messageRoom) {
            throw GraphError(
                "Room id not found",
                "NOT_FOUND"
            )
        }

        const { users } = messageRoom
        await Promise.all(users.map(async (el) => {
            const user = await User.findById(el)
            user.messageRooms = user.messageRooms.filter(room => room !== el)
            return await user.save()
        }))

        return messageRoom
    },
    leaveMessageRoom: async (user, { roomId }) => {
        const messageRoom = await checkFound(roomId, Message)
        messageRoom.users = messageRoom.users.filter(el => el !== user._id)
        await messageRoom.save()
    }
}

module.exports = messageMethod