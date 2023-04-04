const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const Notification = require('../../models/Notification')
const GraphError = require('../../errors')
const { checkFound } = require('../../helpers/methodHelper')
const uploadImage = require('./uploadImage')
const postMethod = {
    // handle query
    getPostsForUser: async (user, page) => {
        const friendIds = user.friends.filter(el => el.status === 'confirm').map(el => el.userId)
        const posts = await Post.find({
            $or: [
                { creatorId: { $in: [user._id, ...friendIds] }, vision: { $ne: 'private' } },
                { vision: 'public' }
            ]
        }).sort('-updatedAt').skip((page - 1) * 10).limit(10)
        const res = posts.map(el => convertPost(el, user._id))
        return res
    },
    getPostsOfOwner: async (userId, page) => {
        const posts = await Post.find({ creatorId: userId }).sort('-updatedAt').skip((page - 1) * 10).limit(10)
        const res = posts.map(el => convertPost(el, userId))
        return res
    },
    getPostsOfUser: async (caller, userId, page) => {
        const vision = ['public']
        const checkFriend = caller.friends.find(el => el.userId.equals(userId) && el.status === 'confirm')
        if (checkFriend) vision.push('friend')
        const posts = await Post.find({ creatorId: userId, vision: { $in: vision } }).sort('updatedAt').skip((page - 1) * 10).limit(10)
        const res = posts.map(el => convertPost(el, caller._id))
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
    likePost: async (user, postId, pushNoti) => {
        const post = await Post.findOneAndUpdate(
            { _id: postId, like: { $ne: user._id } },
            { $push: { like: user._id } },
            { new: true, runValidators: true }
        )

        if (!user._id.equals(post.creatorId)) {
            const oldNoti = await Notification.findOne({ fromId: user._id, option: 'likepost', contentId: postId })
            if (!oldNoti) {
                const regex = /[^><]\w+/gm
                let content = post.content.match(regex)
                if (content) content = content[0].substring(0, 8)
                const noti = new Notification({
                    userId: post.creatorId,
                    fromId: user._id,
                    option: 'likepost',
                    contentId: postId,
                    content: `liked your post "${content}"`
                })

                await noti.save()
                pushNoti({
                    id: noti._id,
                    userId: noti.userId,
                    fromId: noti.fromId,
                    option: noti.option,
                    contentId: noti.contentId,
                    content: noti.content
                })
            }
        }

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

        pushNoti({
            id: 'unlikepost',
            userId: post.creatorId,
            fromId: user._id,
            option: 'unlikepost',
            contentId: postId,
            content: 'unlikepost'
        })
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