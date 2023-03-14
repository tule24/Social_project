const { GraphQLError } = require('graphql')

const GraphError = (errMsg, errCode) => {
    return new GraphQLError(errMsg, {
        extensions: {
            code: errCode
        }
    })
}

module.exports = GraphError