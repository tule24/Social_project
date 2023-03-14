const authResolver = {
    Mutation: {
        register: async (_, { registerInput }, { dbMethods }) => {
            try {
                const user = await dbMethods.regiser(registerInput)
                return {
                    code: "CREATED",
                    success: true,
                    message: "User register success",
                    user
                }
            } catch (error) {
                return {
                    code: error?.extensions?.code || "BAD_REQUEST",
                    success: false,
                    message: error.message,
                    user: null
                }
            }
        },
        login: async (_, { loginInput }, { dbMethods }) => {
            try {
                const user = await dbMethods.login(loginInput)
                return {
                    code: "OK",
                    success: true,
                    message: "User login success",
                    user
                }
            } catch (error) {
                return {
                    code: error?.extensions?.code || "BAD_REQUEST",
                    success: false,
                    message: error.message,
                    user: null
                }
            }
        }
    }
}

module.exports = authResolver