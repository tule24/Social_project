const { authMutation } = require('./authResolver')
const { commentQuery, commentMutation, commentResolver } = require('./commentResolver')
const { postQuery, postMutation, postResolver } = require('./postResolver')
const { userQuery, userMutation, userResolver } = require('./userResolver')
const { messageQuery, messageMutation, messageSubscription, messageResolver } = require('./messageResolver')
const { notificationQuery, notificationSubscription, notificationResolver } = require('./notificationResolver')
const { typeResolver } = require('./typeResolver')

const resolvers = {
    Query: {
        ...userQuery,
        ...postQuery,
        ...commentQuery,
        ...messageQuery,
        ...notificationQuery
    },
    Mutation: {
        ...authMutation,
        ...userMutation,
        ...postMutation,
        ...commentMutation,
        ...messageMutation
    },
    Subscription: {
        ...messageSubscription,
        ...notificationSubscription
    },
    ...userResolver,
    ...postResolver,
    ...commentResolver,
    ...messageResolver,
    ...notificationResolver,
    ...typeResolver
}

module.exports = resolvers