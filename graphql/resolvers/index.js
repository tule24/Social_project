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
    Date: dateResolver,
    AuthResponse: {
        __resolveType(obj) {
            if (obj.code) {
                return 'ErrorResponse'
            } else {
                return 'User'
            }
        }
    },
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
    }
}

module.exports = resolvers