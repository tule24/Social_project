const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const GraphError = require('../../errors')
const { checkFound } = require('../../helpers/methodHelper')

const commentMethod = {
    // handle query
    getCommentsOfPost: async (postId, page) => {
        const comments = await Comment.find({ postId }).sort('-updatedAt').skip((page - 1) * 10).limit(10)
        return comments
    },
    getRepliesOfComment: async (commentId, page) => {
        const comment = await checkFound(commentId)
        const { replies } = comment
        return replies.slice((page- 1)* 10, page)
    },
    // handle mutation
    createComment: async (user, postId, { content, media }) => {
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
            media: media || [],
            like: [],
            replies: []
        })

        post.totalComment += 1

        await comment.save()
        await post.save()
        return comment
    },
    updateComment: async (user, commentId, commentInput) => {
        const comment = await Comment.findOneAndUpdate({ _id: commentId, creatorId: user._id }, commentInput, { new: true, runValidators: true })
        if (!comment) {
            throw GraphError(
                "Comment not found or you aren't comment's owner",
                "NOT_FOUND"
            )
        }
        return comment
    },
    handleLikeComment: async (user, commentId) => {
        const comment = await checkFound(commentId, Comment)
        const oldLength = comment.like.length
        comment.like = comment.like.filter(el => el !== user._id)
        if (oldLength === comment.like.length) {
            comment.like.push(user._id)
            comment.totalLike += 1
        } else {
            comment.totalLike -= 1
        }

        await comment.save()
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
    createReplies: async (user, commentId, { content, media }) => {
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
            media: media || [],
            like: [],
        }

        comment.replies.push(replies)
        await comment.save()
        return replies
    },
    updateReplies: async (user, commentId, repliesId, repliesInput) => {
        const comment = await checkFound(commentId, Comment)
        const replies = comment.replies
        const i = replies.find(el => el._id.equals(repliesId))
        if (i < 0) {
            throw GraphError(
                "Replies not found",
                "NOT_FOUND"
            )
        }

        if (replies[i].creatorId !== user._id) {
            throw GraphError(
                "You aren't replies owner",
                "UNAUTHORIZED"
            )
        }

        replies[i] = { ...replies[i], ...repliesInput }
        comment.replies = replies
        await comment.save()
        return replies[i]
    },
    deleteReplies: async (user, commentId, repliesId) => {
        const comment = await checkFound(commentId, Comment)
        const i = comment.replies.findIndex(el => el._id.equals(repliesId))

        if (i < 0) {
            throw GraphError(
                "Replies not found",
                "NOT_FOUND"
            )
        }

        if (comment.replies[i].creatorId !== user._id) {
            throw GraphError(
                "You aren't replies owner",
                "UNAUTHORIZED"
            )
        }

        const result = comment.replies.splice(i, 1)
        await comment.save()
        return result[0]
    },
    handleLikeReplies: async (user, commentId, repliesId) => {
        const comment = await checkFound(commentId, Comment)
        const replies = comment.replies
        const i = replies.find(el => el._id.equals(repliesId))

        if (i < 0) {
            throw GraphError(
                "Replies not found",
                "NOT_FOUND"
            )
        }
        const oldLength = replies[i].like.length
        replies[i].like = replies[i].like.filter(el => el !== user._id)
        if (oldLength === replies[i].like.length) {
            replies[i].like.push(user._id)
            replies[i].totalLike += 1
        } else {
            replies[i].totalLike -= 1
        }

        comment.replies = replies
        await comment.save()
        return replies[i]
    }
}

module.exports = commentMethod