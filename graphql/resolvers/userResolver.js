const userResolver = {
    Query: {
        users: (_, { name }, { dbMethods }) => {
            return dbMethods.getAllUser(name)
        },
        user: (_, { wallet }, { dbMethods }) => {
            return dbMethods.getUser(wallet)
        }
    },
    User: {
        friends: ({ id }, _, { dbMethods }) => {
            return dbMethods.getFriendOfUser(id)
        },
        posts: ({ id }, _, { dbMethods }) => {
            return dbMethods.getPostsOfUser(id)
        }
    }
}

module.exports = userResolver