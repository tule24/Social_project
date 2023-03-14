const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const checkPassword = async (password, hashedPassword) => {
    const check = await bcrypt.compare(password, hashedPassword)
    return check
}

const checkPasswordChange = function (passwordChangedAt, JWTTimestamp) {
    if (passwordChangedAt) {
        const changedTimestamp = parseInt(passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimestamp
    }
    return false
}

const createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex")
    const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    const passwordResetExpires = Date.now() + 10 * 60 * 1000

    return { resetToken, passwordResetToken, passwordResetExpires }
}

const createJWT = (userId) => jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
)

const createRefreshJWT = (userId) => jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_LIFETIME }
)

module.exports = { checkPassword, createJWT, checkPasswordChange, createPasswordResetToken, createRefreshJWT }