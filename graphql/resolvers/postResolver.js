const catchAsync = require('../../helpers/catchAsync')
const { checkAuth } = require('../../helpers/authHelper')
const { pushNoti } = require('../../graphql/resolvers/notificationResolver')

const postQuery = {
    post: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getPostById(user._id, postId)
    }),
    postForUser: catchAsync(async (_, { page }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getPostsForUser(user, page)
    }),
    postOfUser: catchAsync(async (_, { userId, page }, { dbMethods, req }) => {
        const caller = await checkAuth(req)
        return await dbMethods.getPostsOfUser(caller, userId, page)
    }),
    postOfOwner: catchAsync(async (_, { page }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getPostsOfOwner(user._id, page)
    })
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
    likePost: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.likePost(user, postId, pushNoti)
    }),
    unlikePost: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.unlikePost(user, postId, pushNoti)
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
        totalLike: ({ like }) => {
            return like.length
        }
    }
}

module.exports = { postQuery, postMutation, postResolver }