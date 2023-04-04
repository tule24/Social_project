const Message = require('../../models/Message')
const User = require('../../models/User')
const GraphError = require('../../errors')
const { checkFound, pagination } = require('../../helpers/methodHelper')

const messageMethod = {
    // query
    getMessageRoom: async (user, roomId, args) => {
        const messageRoom = await checkFound(roomId, Message)
        const checkInRoom = messageRoom.users.includes(user._id)
        if (!checkInRoom) {
            throw GraphError(
                "You don't have permission to access this room",
                "UNAUTHORIZED"
            )
        }

        const { limit, skip } = pagination(args)
        const { messages } = messageRoom._doc
        const newMsg = messages.slice(skip, skip + limit)
        return {
            ...messageRoom._doc,
            id: messageRoom._id,
            messages: newMsg
        }
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
            message: content,
            createdAt: Date.now()
        }
        if (messageRoom?.lastMessage?.creatorId?.equals(user._id)) {
            messageRoom.messages[0].content.push(message)
        } else {
            const newMessage = {
                creatorId: user._id,
                content: [message]
            }
            messageRoom.messages.unshift(newMessage)
        }

        messageRoom.lastMessage = {
            creatorId: user._id,
            content
        }
        await messageRoom.save()
        const newMessage = messageRoom.messages.shift()

        pubsub.publish('MESSAGE_CREATED', {
            messageCreated: {
                users: messageRoom.users,
                id: newMessage._id,
                roomId,
                creator: user,
                ...newMessage._doc
            }
        })
        return {
            id: newMessage._id,
            creator: user,
            ...newMessage._doc
        }
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