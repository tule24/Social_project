const catchAsync = require('../../helpers/catchAsync')

const authResolver = {
    Mutation: {
        register: catchAsync(async (_, { registerInput }, { dbMethods }) => {
            const user = await dbMethods.regiser(registerInput)
            return user
        }),
        login: catchAsync(async (_, { loginInput }, { dbMethods }) => {
            const auth = await dbMethods.login(loginInput)
            return auth
        }),
        logout: catchAsync(async (_, __, { dbMethods, req }) => {
            await dbMethods.logout(req)
            return {
                code: "OK",
                message: "Logout success"
            }
        })
    }
}

module.exports = authResolver