const { GraphQLScalarType } = require('graphql')

const dateResolver = new GraphQLScalarType({
    name: 'Date',
    parseValue(value) {
        return new Date(value)
    },
    serialize(value) {
        return value.toLocaleString()
    }
})

const resolveType = (obj, type) => {
    if (obj.code) {
        return 'MsgResponse'
    }
    return type
}

const typeResolver = {
    Date: dateResolver,
    AuthResponse: {
        __resolveType(obj) {
            return resolveType(obj, 'Auth')
        }
    },
    UserResponse: {
        __resolveType(obj) {
            return resolveType(obj, 'User')
        }
    },
    AllUserResponse: {
        __resolveType(obj) {
            return resolveType(obj, 'AllUser')
        }
    },
    AllPostResponse: {
        __resolveType(obj) {
            return resolveType(obj, 'AllPost')
        }
    },
    PostResponse: {
        __resolveType(obj) {
            return resolveType(obj, 'Post')
        }
    },
    CommentResponse: {
        __resolveType(obj) {
            return resolveType(obj, 'Comment')
        }
    }
}

module.exports = { typeResolver }