const cloudinary = require('cloudinary').v2

const connectToCloudinary = ()=>{
    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_API_KEY
});
}
module.exports = connectToCloudinary;