const { checkAuth } = require('../../helpers/authHelper')
const postResolver = {
    // Query: {
    //     postsForUser: async (_, __, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             const posts = await dbMethods.getPostsForUser(user)
    //             return posts
    //         } catch (error) {
    //             return error
    //         }
    //     },
    //     postsOfUser: async (_, __, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             const posts = await dbMethods.getPostsOfUser(user)
    //             return posts
    //         } catch (error) {
    //             return error
    //         }
    //     }
    // },
    // Mutation: {
    //     createPost: async (_, { postInput }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             const post = await dbMethods.createPost(user, postInput)
    //             return {
    //                 code: "CREATED",
    //                 success: true,
    //                 message: "Create new post success",
    //                 post
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message,
    //                 post: null
    //             }
    //         }
    //     },
    //     updatePost: async (_, { postId, postInput }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             const post = await dbMethods.updatePost(user, postId, postInput)
    //             return {
    //                 code: "OK",
    //                 success: true,
    //                 message: "Update post success",
    //                 post
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message,
    //                 post: null
    //             }
    //         }
    //     },
    //     handleLikePost: async (_, { postId }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             await dbMethods.handleLikePost(user, postId)
    //             return {
    //                 code: "OK",
    //                 success: true,
    //                 message: "Handle like post success"
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message
    //             }
    //         }
    //     },
    //     deletePost: async (_, { postId }, { dbMethods, req }) => {
    //         try {
    //             const user = await checkAuth(req)
    //             const post = await dbMethods.deletePost(user, postId)
    //             return {
    //                 code: "OK",
    //                 success: true,
    //                 message: "Delete post success",
    //                 post
    //             }
    //         } catch (error) {
    //             return {
    //                 code: error?.extensions?.code || "BAD_REQUEST",
    //                 success: false,
    //                 message: error.message,
    //                 post: null
    //             }
    //         }
    //     }
    // },
    // Post: {
    //     creator: ({ creatorId }, _, { dbMethods }) => {
    //         return dbMethods.getUserById(creatorId)
    //     },
    //     comments: ({ id }, _, { dbMethods }) => {
    //         return dbMethods.getCommentsOfPost(id)
    //     },
    //     userLike: ({ like }, _, { dbMethods }) => {
    //         return dbMethods.getUserLike(like)
    //     }
    // }
}

module.exports = postResolver