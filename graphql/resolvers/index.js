const { authMutation } = require('./authResolver')
const { commentQuery, commentMutation, commentResolver } = require('./commentResolver')
const { postQuery, postMutation, postResolver } = require('./postResolver')
const { userQuery, userMutation, userResolver } = require('./userResolver')
const { typeResolver } = require('./typeResolver')

const resolvers = {
    Query: {
        ...userQuery,
        ...postQuery,
        ...commentQuery
    },
    Mutation: {
        ...authMutation,
        ...userMutation,
        ...postMutation,
        ...commentMutation
    },
    ...userResolver,
    ...postResolver,
    ...commentResolver,
    ...typeResolver
}

module.exports = resolvers