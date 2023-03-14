const { GraphQLError } = require('graphql')

const catchAsync = (fn) => {
    return async (parent, args, context, info) => await fn(parent, args, context, info)
        .catch(err => {
            let customError = {
                code: "INTERNAL_SERVER_ERROR",
                message: err.message
            }
            if (err instanceof GraphQLError) {
                customError.code = err.extensions.code
                customError.message = err.message
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
            return customError
        })
}

module.exports = catchAsync