const { GraphQLError } = require('graphql')
const GraphError = require('../errors')

const catchAsync = (fn) => {
    return async (parent, args, context, info) => await fn(parent, args, context, info)
        .catch(err => {
            const customError = {
                code: 'INTERNAL_ERROR',
                message: "Internal server error"
            }
            if (err instanceof GraphQLError) {
                throw err
            } else {
                if (err.name == 'ValidationError') {
                    customError.code = 'BAD_REQUEST'
                    customError.message = Object.values(err.errors).map(item => item.message).join('')
                }
                if (err.code && err.code === 11000) {
                    customError.code = 'BAD_REQUEST'
                    customError.message = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`
                }
                if (err.name = "CastError") {
                    customError.code = 'BAD_REQUEST'
                    customError.message = err.message
                }
            }
            throw GraphError(
                customError.message,
                customError.code
            )
        })
}

module.exports = catchAsync