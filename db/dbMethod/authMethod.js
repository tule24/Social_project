const User = require('../../models/User')
const { checkPassword, createRefreshJWT, createJWT, checkAuth } = require('../../helpers/authHelper')
const GraphError = require('../../errors')

const authMethod = {
    // handle mutation
    regiser: async ({ name, password, email }) => {
        if (!name || !password || !email) {
            throw GraphError(
                "Please provide name, password & email",
                "BAD_REQUEST"
            )
        }

        const user = await User.findOne({ email })
        if (user) {
            throw GraphError(
                "Email already exist",
                "BAD_REQUEST"
            )
        }

        const newUser = await User.create({
            name,
            password,
            email
        })

        return newUser
    },
    login: async ({ email, password }) => {
        if (!email || !password) {
            throw GraphError(
                "Please provide email & password",
                "BAD_REQUEST"
            )
        }

        const user = await User.findOne({ email })
        if (!user) {
            throw GraphError(
                "Email not register",
                "BAD_REQUEST"
            )
        }

        const checkPass = await checkPassword(password, user.password)
        if (!checkPass) {
            throw GraphError(
                "Password not match",
                "UNAUTHORIZED"
            )
        }

        user.refreshToken = createRefreshJWT(user._id)
        await user.save()

        return {
            user,
            token: createJWT(user._id),
            refreshToken: user.refreshToken
        }
    },
    logout: async (req) => {
        const user = await checkAuth(req)
        user.refreshToken = null
        await user.save()
    }
}

module.exports = authMethod