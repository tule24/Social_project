const Post = require('../../models/Post')
const GraphError = require('../../errors')

const postMethod = {
    createPost: async ({ _id }, { content, media, vision }) => {
        const newPost = new Post({
            creatorId: _id,
            content,
            media: media || [],
            vision: vision || "friend"
        })

        await newPost.save()
        return newPost
    },
    updatePost: async ({ _id }, postId, postInput) => {
        if (!postId) {
            throw GraphError(
                "Please provide post id",
                "BAD_REQUEST"
            )
        }

        const post = await Post.findOneAndUpdate({ _id: postId, creatorId: _id }, postInput, { new: true, runValidators: true })
        if (!post) {
            throw GraphError(
                "Post not exist or you aren't post's owner",
                "NOT_FOUND"
            )
        }
        return post
    },
    handleLikePost: async ({ _id }, postId) => {
        if (!postId) {
            throw GraphError(
                "Please provide post id",
                "BAD_REQUEST"
            )
        }

        const post = await Post.findById(postId)
        if (!post) {
            throw GraphError(
                "Post not found",
                "NOT_FOUND"
            )
        }

        const oldLength = post.like.length
        post.like = post.like.filter(el => el !== _id)
        if (oldLength === post.like.length) {
            post.like.push(_id)
        }

        await post.save()
    },
    deletePost: async ({ _id }, postId) => {
        if (!postId) {
            throw GraphError(
                "Please provide post id",
                "BAD_REQUEST"
            )
        }

        const post = await Post.findOneAndDelete({ _id: postId, creatorId: _id })
        if (!post) {
            throw GraphError(
                "Post not found",
                "NOT_FOUND"
            )
        }
        return post
    },
    getPostsForUser: async (user) => {
        const posts = await Post.find({
            $or: [
                { creatorId: { $in: [user._id, ...user.friends] } },
                { vision: 'public' }
            ]
        })

        return posts
    },
    getPostsOfUser: async (id) => {
        const posts = await Post.find({ creatorId: id })
        return posts
    }
}

module.exports = postMethod