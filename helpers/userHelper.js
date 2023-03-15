const GraphError = require('../errors')
const User = require('../models/User')

const removeId = (arr, userId) => {
    const index = arr.findIndex(el => el.userId === userId)
    if (index < 0) {
        throw GraphError(
            "ID not exist",
            "BAD_REQUEST"
        )
    }
    arr.splice(index, 1)
    return arr
}

const updateId = (arr, userId, status) => {
    const index = arr.findIndex(el => el.userId === userId)
    if (index < 0) {
        throw GraphError(
            "ID not exist",
            "BAD_REQUEST"
        )
    }
    arr[index].status = status
    return arr
}

const addId = (arr, userId, status) => {
    if (arr.find(el => el.userId === userId)) {
        throw GraphError(
            "ID is exist",
            "BAD_REQUEST"
        )
    }
    arr.push({
        userId,
        status
    })
    return arr
}

const checkFound = async (id) => {
    const user = await User.findById(id)
    if (!user) {
        throw GraphError(
            "User not exist",
            "NOT_FOUND"
        )
    }
    return user
}

module.exports = { updateId, addId, removeId, checkFound }