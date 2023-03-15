const { GraphQLScalarType } = require('graphql')
const authResolver = require('./authResolver')
const commentResolver = require('./commentResolver')
const postResolver = require('./postResolver')
const userResolver = require('./userResolver')

const dateResolver = new GraphQLScalarType({
    name: 'Date',
    parseValue(value) {
        return new Date(value)
    },
    serialize(value) {
        return value.toLocaleString()
    }
})
const resolvers = {
    Query: {
        ...userResolver.Query,
        ...postResolver.Query
    },
    Mutation: {
        ...authResolver.Mutation,
        ...userResolver.Mutation
    },
    User: {
        ...userResolver.User
    },
    Post: {
        ...postResolver.Post
    },
    BaseComment: {
        ...commentResolver.BaseComment
    },
    Comment: {
        ...commentResolver.Comment
    },
    Date: dateResolver,
    AuthResponse: {
        __resolveType(obj) {
            if (obj.code) {
                return 'MessageResponse'
            }
            if (obj.token) {
                return 'Auth'
            }
            return null
        }
    },
    UserResponse: {
        __resolveType(obj) {
            if (obj.code) {
                return 'MessageResponse'
            }
            if (obj.email) {
                return 'User'
            }
            return null
        }
    },
    AllUserResponse: {
        __resolveType(obj) {
            if (obj.code) {
                return 'MessageResponse'
            }
            if (obj.totalUser) {
                return 'AllUser'
            }
            return null
        }
    }
}

module.exports = resolvers