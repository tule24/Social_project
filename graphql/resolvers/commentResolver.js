const commentResolver = {
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
    }
}

module.exports = commentResolver