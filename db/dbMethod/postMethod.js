const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const GraphError = require('../../errors')
const { checkFound } = require('../../helpers/methodHelper')

const postMethod = {
    // handle query
    getPostsForUser: async (user) => {
        const friendIds = user.friends.filter(el => el.status === 'confirm').map(el => el.userId)
        const posts = await Post.find({
            $or: [
                { creatorId: { $in: [user._id, ...friendIds] } },
                { vision: 'public' }
            ]
        })
        return posts
    },
    getPostsOfUser: async (id) => {
        const posts = await Post.find({ creatorId: id })
        return posts
    },
    getPostById: async (postId) => {
        const post = await Post.findById(postId)
        return post
    },
    // handle mutation
    createPost: async (user, { content, media, vision }) => {
        if (!content) {
            throw GraphError(
                "Please provide content",
                "BAD_REQUEST"
            )
        }

        const newPost = new Post({
            creatorId: user._id,
            content,
            media: media || [],
            vision: vision || "friend"
        })

        await newPost.save()
        return newPost
    },
    updatePost: async (user, postId, postInput) => {
        const post = await Post.findOneAndUpdate({ _id: postId, creatorId: user._id }, postInput, { new: true, runValidators: true })
        if (!post) {
            throw GraphError(
                "Post not found or you aren't post's owner",
                "NOT_FOUND"
            )
        }
        return post
    },
    handleLikePost: async (user, postId) => {
        const post = await checkFound(postId, Post)

        const oldLength = post.like.length
        post.like = post.like.filter(el => !el.equals(user._id))
        if (oldLength === post.like.length) {
            post.like.push(user._id)
            post.totalLike += 1
        } else {
            post.totalLike -= 1
        }

        await post.save()
        return post
    },
    deletePost: async (user, postId) => {
        const post = await Post.findOneAndDelete({ _id: postId, creatorId: user._id })
        if (!post) {
            throw GraphError(
                "Post not found or you aren't post's owner",
                "NOT_FOUND"
            )
        }

        await Comment.deleteMany({ postId })
        return post
    },
}

module.exports = postMethod