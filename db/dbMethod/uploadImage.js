const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const opts = {
    overwrite: true,
    resource_type: "auto",
    folder: process.env.CLOUDINARY_FOLDER
}

const uploadImage = async (images) => {
    const res = await Promise.all(images.map(async(image) => {
        return cloudinary.uploader.upload(image, opts).then(data => data).catch(err => err)
    }))

    return res.map(el => el.url)
}

module.exports = uploadImage