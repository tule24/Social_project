const GraphError = require('../errors')
const User = require('../models/User')

const removeId = (arr, userId) => {
    const index = arr.findIndex(el => el.userId.equals(userId))
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
    const index = arr.findIndex(el => el.userId.equals(userId))
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
    if (arr.find(el => el.userId.equals(userId))) {
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

const checkFound = async (id, Model) => {
    if (!id) {
        throw GraphError(
            "Please provide ID",
            "BAD_REQUEST"
        )
    }
    const ele = await Model.findById(id)
    if (!ele) {
        throw GraphError(
            "Id not found",
            "NOT_FOUND"
        )
    }
    return ele
}

const pagination = (args) => {
    const page = Number(args.page) || 1
    const limit = Number(args.limit) || 10
    const skip = (page - 1) * limit
    return { limit, skip }
}

module.exports = { updateId, addId, removeId, checkFound, pagination }