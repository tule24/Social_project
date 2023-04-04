const { catchAsync } = require('../../helpers/catchAsync')

const authMutation = {
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
        return "Logout success"
    }),
    refreshToken: catchAsync(async (_, { refreshToken }, { dbMethods }) => {
        return await dbMethods.refreshToken(refreshToken)
    })
}

module.exports = { authMutation }