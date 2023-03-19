const { authMutation } = require('./authResolver')
const { commentQuery, commentMutation, commentResolver } = require('./commentResolver')
const { postQuery, postMutation, postResolver } = require('./postResolver')
const { userQuery, userMutation, userResolver } = require('./userResolver')
const { messageQuery, messageMutation, messageSubscription, messageResolver } = require('./messageResolver')
const { typeResolver } = require('./typeResolver')

const resolvers = {
    Query: {
        ...userQuery,
        ...postQuery,
        ...commentQuery,
        ...messageQuery
    },
    Mutation: {
        ...authMutation,
        ...userMutation,
        ...postMutation,
        ...commentMutation,
        ...messageMutation
    },
    Subscription: {
        ...messageSubscription
    },
    ...userResolver,
    ...postResolver,
    ...commentResolver,
    ...messageResolver,
    ...typeResolver
}

module.exports = resolvers