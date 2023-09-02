import { v2 as cloudinary } from 'cloudinary'
import * as dotenv from 'dotenv';
dotenv.config()

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadImage = async (imagePath: string) => {
    console.log(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
    console.log('image path: ', imagePath)
    console.log('start uploading')
    console.log('cloudinary: ', cloudinary)
    const url = await cloudinary.uploader.upload(imagePath).then(res => res.secure_url).catch(err => console.log('error while uploading image to cloudinary: ', err.message))
    return url
}

export default cloudinary;