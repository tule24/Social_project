const catchAsync = require('../../helpers/catchAsync')
const authResolver = {
    Mutation: {
        register: catchAsync(async (_, { registerInput }, { dbMethods }) => {
            const user = await dbMethods.regiser(registerInput)
            return user
        }),
        login: catchAsync(async (_, { loginInput }, { dbMethods }) => {
            const user = await dbMethods.login(loginInput)
            return user
        })
    }
}

module.exports = authResolver