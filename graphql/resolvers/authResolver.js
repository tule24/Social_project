const catchAsync = require('../../helpers/catchAsync')
const { checkAuth } = require('../../helpers/authHelper')

const authResolver = {
    Mutation: {
        register: catchAsync(async (_, { registerInput }, { dbMethods }) => {
            const user = await dbMethods.regiser(registerInput)
            return user
        }),
        login: catchAsync(async (_, { loginInput }, { dbMethods }) => {
            const user = await dbMethods.login(loginInput)
            return user
        }),
        logout: catchAsync(async (_, __, { dbMethods, req }) => {
            const auth = await checkAuth(req)
            const user = await dbMethods.logout(auth)
            return user
        })
    }
}

module.exports = authResolver