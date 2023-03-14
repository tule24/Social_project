const { comments } = require('../sampleData.json')

const commentMethod = {
    getCommentsOfPost: (postId) => {
        const postComment = comments.find(el => el.postId === postId)
        return postComment ? postComment.commentArr : []
    },
}

module.exports = commentMethod