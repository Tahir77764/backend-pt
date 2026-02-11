import { v2 as cloudinary } from 'cloudinary';

const CloudName = process.env.CLOUDINARY_CLOUD_NAME;
const CloudAPI_Key = process.env.CLOUDINARY_API_KEY;
const CloudAPI_Secret = process.env.CLOUDINARY_API_SECRET

const cloudinaryConnect = async () =>{
  try {
    cloudinary.config({ cloud_name: CloudName, api_key: CloudAPI_Key, api_secret: CloudAPI_Secret }); 
    console.log("VT Printz server has been Connected from Cloudinary Successfully");
  } catch (error) {
    console.log("Error Connecting to Cloudinary Server \n", err);
    process.exit(1);
  }
    
}

export default cloudinaryConnect