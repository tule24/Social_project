const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const Notification = require('../../models/Notification')
const GraphError = require('../../errors')
const { checkFound } = require('../../helpers/methodHelper')

const commentMethod = {
    // handle query
    getCommentsOfPost: async (userId, postId, page) => {
        const comments = await Comment.find({ postId }).sort('-updatedAt').skip((page - 1) * 10).limit(10)
        const res = comments.map(el => convertComment(el, userId))
        return res
    },
    getCommentById: async (commentId) => {
        const comment = await checkFound(commentId, Comment)
        return comment
    },
    getRepliesOfComment: async (userId, commentId, page) => {
        const comment = await checkFound(commentId, Comment)
        const { replies } = comment
        const res = replies.slice((page - 1) * 10, 10).map(el => convertReplies(el, userId))
        return res
    },
    getRepliesById: async (commentId, repliesId) => {
        const comment = await checkFound(commentId, Comment)
        const replies = comment.replies.find(el => el._id.equals(repliesId))
        if (!replies) {
            throw GraphError(
                "Replies not found",
                "NOT_FOUND"
            )
        }
        return replies
    },
    // handle mutation
    createComment: async (user, postId, content, pushNoti) => {
        const post = await checkFound(postId, Post)
        if (!content) {
            throw GraphError(
                "Please provide content",
                "BAD_REQUEST"
            )
        }

        const comment = new Comment({
            postId,
            creatorId: user._id,
            content,
            like: [],
            replies: []
        })

        post.totalComment += 1

        if (user._id !== post.creatorId) {
            const regex = /[^><]\w+/gm
            let content = post.content.match(regex)
            if (content) content = content[0].substring(0, 8)

            const noti = new Notification({
                userId: post.creatorId,
                fromId: user._id,
                option: 'commentpost',
                contentId: postId,
                content: `commented on your post "${content}"`
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

        await comment.save()
        await post.save()
        return comment
    },
    updateComment: async (user, commentId, content) => {
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, creatorId: user._id },
            { content },
            { new: true, runValidators: true }
        )
        if (!comment) {
            throw GraphError(
                "Comment not found or you aren't comment's owner",
                "NOT_FOUND"
            )
        }
        return comment
    },
    likeComment: async (user, commentId) => {
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, like: { $ne: user._id } },
            { $push: { like: user._id } },
            { new: true, runValidators: true }
        )
        if (!comment) {
            throw GraphError(
                "You already liked this comment",
                "BAD_REQUEST"
            )
        }
        return comment
    },
    unlikeComment: async (user, commentId) => {
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, like: user._id },
            { $pull: { like: user._id } },
            { new: true, runValidators: true }
        )
        if (!comment) {
            throw GraphError(
                "You didn't like this comment",
                "BAD_REQUEST"
            )
        }
        return comment
    },
    deleteComment: async (user, commentId) => {
        const comment = await Comment.findOneAndDelete({ _id: commentId, creatorId: user._id })
        if (!comment) {
            throw GraphError(
                "Comment not found or you aren't comment's owner",
                "NOT_FOUND"
            )
        }

        const post = await Post.findById(comment.postId)
        post.totalComment -= 1
        await post.save()

        return comment
    },
    createReplies: async (user, commentId, content) => {
        const comment = await checkFound(commentId, Comment)
        if (!content) {
            throw GraphError(
                "Please provide content",
                "BAD_REQUEST"
            )
        }

        const replies = {
            creatorId: user._id,
            content,
            like: [],
        }

        comment.replies.push(replies)
        await comment.save()
        const newRep = comment.replies.pop()
        return newRep
    },
    updateReplies: async (user, commentId, repliesId, content) => {
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, 'replies._id': repliesId, 'replies.creatorId': user._id },
            { $set: { 'replies.$.content': content } },
            { new: true, runValidators: true }
        )
        if (!comment) {
            throw GraphError(
                "Replies not found or you not replies's owner",
                "NOT_FOUND"
            )
        }
        const result = comment.replies.find(el => el._id.equals(repliesId))
        return result
    },
    deleteReplies: async (user, commentId, repliesId) => {
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, 'replies._id': repliesId, 'replies.creatorId': user._id },
            { '$pull': { replies: { _id: repliesId } } }
        )
        if (!comment) {
            throw GraphError(
                "Replies not found or you not replies's owner",
                "NOT_FOUND"
            )
        }
        return { id: repliesId }
    },
    likeReplies: async (user, commentId, repliesId) => {
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, 'replies._id': repliesId, 'replies.like': { $ne: user._id } },
            { $push: { "replies.$.like": user._id } },
            { new: true, runValidators: true }
        )
        if (!comment) {
            throw GraphError(
                "You already liked this replies",
                "BAD_REQUEST"
            )
        }
        const result = comment.replies.find(el => el._id.equals(repliesId))
        return result
    },
    unlikeReplies: async (user, commentId, repliesId) => {
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, 'replies._id': repliesId, 'replies.like': user._id },
            { $pull: { "replies.$.like": user._id } },
            { new: true, runValidators: true }
        )
        if (!comment) {
            throw GraphError(
                "You didn't like this replies",
                "BAD_REQUEST"
            )
        }
        const result = comment.replies.find(el => el._id.equals(repliesId))
        return result
    }
}

const convertComment = (comment, userId) => {
    return {
        id: comment._id,
        postId: comment.postId,
        creatorId: comment.creatorId,
        content: comment.content,
        like: comment.like,
        replies: comment.replies,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        liked: comment.like.includes(userId)
    }
}

const convertReplies = (replies, userId) => {
    return {
        id: replies._id,
        creatorId: replies.creatorId,
        content: replies.content,
        like: replies.like,
        createdAt: replies.createdAt,
        liked: replies.like.includes(userId)
    }
}
module.exports = commentMethod