const catchAsync = require('../../helpers/catchAsync')
const { checkAuth } = require('../../helpers/authHelper')

const postQuery = {
    post: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        await checkAuth(req)
        return await dbMethods.getPostById(postId)
    }),
}

const postMutation = {
    createPost: catchAsync(async (_, { postInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createPost(user, postInput)
    }),
    updatePost: catchAsync(async (_, { postId, postInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updatePost(user, postId, postInput)
    }),
    handleLikePost: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleLikePost(user, postId)
    }),
    deletePost: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deletePost(user, postId)
    })
}

const postResolver = {
    Post: {
        creator: catchAsync(({ creatorId }, _, { dbMethods }) => {
            return dbMethods.getUserById(creatorId)
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }),
        commentList: catchAsync(({ id }, _, { dbMethods }) => {
            return dbMethods.getCommentsOfPost(id)
        })
    }
}

module.exports = { postQuery, postMutation, postResolver }