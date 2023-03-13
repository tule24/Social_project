const resolvers = {
    Query: {
        users: (_, { name }, { dbMethods }) => {
            return dbMethods.getAllUser(name)
        },
        user: (_, { wallet }, { dbMethods }) => {
            return dbMethods.getUser(wallet)
        },
        posts: (_, __, { dbMethods }) => {
            return dbMethods.getPosts()
        }
    },
    User: {
        friends: ({ id }, _, { dbMethods }) => {
            return dbMethods.getFriendOfUser(id)
        },
        posts: ({ id }, _, { dbMethods }) => {
            return dbMethods.getPostsOfUser(id)
        }
    },
    BaseComment: {
        user: ({ userId }, _, { dbMethods }) => {
            return dbMethods.getUserById(userId)
        },
        likes: ({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }
    },
    Comment: {
        user: ({ userId }, _, { dbMethods }) => {
            return dbMethods.getUserById(userId)
        },
        likes: ({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        },
        childComments: ({ childs }) => {
            console.log(childs)
            return childs
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

module.exports = resolvers