const { users, posts, comments } = require('./sampleData.json')

const dbMethods = {
    getAllUser: (name) => {
        if (name) {
            return users.filter(el => el.name.includes(name))
        }
        return users
    },
    getUser: (wallet) => users.find(el => el.wallet === wallet),
    getUserById: (id) => users.find(el => el.id === id),
    getFriendOfUser: (userId) => {
        const friendIds = users.find(el => el.id === userId).friends;
        const friends = friendIds.map(el => users.find(user => user.id === el))
        return friends
    },
    getPostsOfUser: (userId) => posts.filter(el => el.creatorId === userId),
    getCommentsOfPost: (postId) => {
        const postComment = comments.find(el => el.postId === postId)
        return postComment ? postComment.commentArr : []
    },
    getCommentChilds: () => {
        
    },
    getUserLike: (like) => {
        if (like) {
            const friends = like.map(el => users.find(user => user.id === el))
            return friends
        }
        return []
    },
    getPosts: () => posts
}

module.exports = dbMethods