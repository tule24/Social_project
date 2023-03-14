const { posts } = require('../sampleData.json')

const postMethod = {
    getPosts: () => posts,
    getPostsOfUser: (userId) => posts.filter(el => el.creatorId === userId),
}

module.exports = postMethod