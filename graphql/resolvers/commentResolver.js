const catchAsync = require('../../helpers/catchAsync')
const { checkAuth } = require('../../helpers/authHelper')

const commentQuery = {}

const commentMutation = {
    createComment: catchAsync(async (_, { postId, commentInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createComment(user, postId, commentInput)
    }),
    updateComment: catchAsync(async (_, { commentId, commentInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateComment(user, commentId, commentInput)
    }),
    deleteComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deleteComment(user, commentId)
    }),
    handleLikeComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleLikeComment(user, commentId)
    }),

    createReplies: catchAsync(async (_, { commentId, repliesInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createReplies(user, commentId, repliesInput)
    }),
    updateReplies: catchAsync(async (_, { commentId, repliesId, repliesInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateReplies(user, commentId, repliesId, repliesInput)
    }),
    deleteReplies: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deleteReplies(user, commentId, repliesId)
    }),
    handleLikeReplies: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleLikeReplies(user, commentId, repliesId)
    }),
}

const commentResolver = {
    Comment: {
        creator: catchAsync(({ creatorId }, _, { dbMethods }) => {
            return dbMethods.getUserById(creatorId)
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        })
    },
    Replies: {
        creator: catchAsync(({ creatorId }, _, { dbMethods }) => {
            return dbMethods.getUserById(creatorId)
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }),
    }
}

module.exports = { commentQuery, commentMutation, commentResolver }