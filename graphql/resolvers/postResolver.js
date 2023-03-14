const postResolver = {
    Query: {
        posts: (_, __, { dbMethods }) => {
            return dbMethods.getPosts()
        }
    },
    Mutation: {
        createPost: (_, { postInput }, { dbMethods }) => {

        }
    },
    Post: {
        creator: ({ creatorId }, _, { dbMethods }) => {
            return dbMethods.getUserById(creatorId)
        },
        comments: ({ id }, _, { dbMethods }) => {
            return dbMethods.getCommentsOfPost(id)
        },
        likes: ({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }
    }
}

module.exports = postResolver