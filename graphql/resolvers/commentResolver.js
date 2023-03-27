const catchAsync = require('../../helpers/catchAsync')
const { checkAuth } = require('../../helpers/authHelper')

const commentQuery = {
    commentOfPost: catchAsync(async (_, { postId, page }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getCommentsOfPost(user._id, postId, page)
    }),
    repliesOfComment: catchAsync(async (_, { commentId, page }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getRepliesOfComment(user._id, commentId, page)
    }),
}

const commentMutation = {
    createComment: catchAsync(async (_, { postId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createComment(user, postId, content)
    }),
    updateComment: catchAsync(async (_, { commentId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateComment(user, commentId, content)
    }),
    deleteComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deleteComment(user, commentId)
    }),
    handleLikeComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleLikeComment(user, commentId)
    }),

    createReplies: catchAsync(async (_, { commentId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createReplies(user, commentId, content)
    }),
    updateReplies: catchAsync(async (_, { commentId, repliesId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateReplies(user, commentId, repliesId, content)
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
        }),
        totalReplies: ({ replies }) => {
            return replies.length
        },
        totalLike: ({ like }) => {
            return like.length
        },

    },
    Replies: {
        creator: catchAsync(({ creatorId }, _, { dbMethods }) => {
            return dbMethods.getUserById(creatorId)
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }),
        totalLike: ({ like }) => {
            return like.length
        },
    }
}

module.exports = { commentQuery, commentMutation, commentResolver }