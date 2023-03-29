const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const GraphError = require('../../errors')
const { checkFound } = require('../../helpers/methodHelper')
const uploadImage = require('./uploadImage')
const postMethod = {
    // handle query
    getPostsForUser: async (user, page) => {
        const friendIds = user.friends.filter(el => el.status === 'confirm').map(el => el.userId)
        const posts = await Post.find({
            $or: [
                { creatorId: { $in: [user._id, ...friendIds] } },
                { vision: 'public' }
            ]
        }).sort('-updatedAt').skip((page - 1) * 10).limit(10)
        const res = posts.map(el => convertPost(el, user._id))
        return res
    },
    getPostsOfUser: async (userId, page) => {
        const posts = await Post.find({ creatorId: userId }).sort('-updatedAt').skip((page - 1) * 10).limit(10)
        const res = posts.map(el => convertPost(el, userId))
        return res
    },
    getPostById: async (userId, postId) => {
        const post = await checkFound(postId, Post)
        return convertPost(post, userId)
    },
    // handle mutation
    createPost: async (user, { content, media, vision }) => {
        if (!content) {
            throw GraphError(
                "Please provide content",
                "BAD_REQUEST"
            )
        }

        const newMedia = media ? await uploadImage(media) : []
        const newPost = new Post({
            creatorId: user._id,
            content,
            media: newMedia,
            vision: vision || "public"
        })

        await newPost.save()
        return newPost
    },
    updatePost: async (user, postId, postInput) => {
        const { content, media, vision } = postInput
        let newMedia = []
        if (media) {
            const fileUrl = []
            media.forEach(el => {
                if (el.startsWith('http://res.cloudinary.com')) {
                    newMedia.push(el)
                } else {
                    fileUrl.push(el)
                }
            })
            const fileToImage = await uploadImage(fileUrl)
            newMedia = [...newMedia, ...fileToImage]
        }

        const updateInput = {
            content,
            media: newMedia,
            vision
        }

        const post = await Post.findOneAndUpdate(
            { _id: postId, creatorId: user._id },
            updateInput,
            { new: true, runValidators: true }
        )
        if (!post) {
            throw GraphError(
                "Post not found or you aren't post's owner",
                "NOT_FOUND"
            )
        }
        return post
    },
    likePost: async (user, postId) => {
        const post = await Post.findOneAndUpdate(
            { _id: postId, like: { $ne: user._id } },
            { $push: { like: user._id } },
            { new: true, runValidators: true }
        )
        if (!post) {
            throw GraphError(
                "You already liked this post",
                "BAD_REQUEST"
            )
        }
        return post
    },
    unlikePost: async (user, postId) => {
        const post = await Post.findOneAndUpdate(
            { _id: postId, like: user._id },
            { $pull: { like: user._id } },
            { new: true, runValidators: true }
        )
        if (!post) {
            throw GraphError(
                "You didn't like this post",
                "BAD_REQUEST"
            )
        }
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

const convertPost = (post, userId) => {
    return {
        id: post._id,
        creatorId: post.creatorId,
        content: post.content,
        media: post.media,
        like: post.like,
        vision: post.vision,
        totalComment: post.totalComment,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        liked: post.like.includes(userId)
    }
}

module.exports = postMethod