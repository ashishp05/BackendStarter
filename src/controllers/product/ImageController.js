const cloudinary = require("../../utils/cloudinary")
exports.imageUploadToCloudinary = async (req) => {
    const providedFile = req.files || null;
    const imageUrls = [] ;
    if (providedFile) {
        for (const file of providedFile) {
          const uploadRes = await new Promise((res, rej) => {
            cloudinary.uploader
              .upload_stream({ folder: "products" }, (error, result) => {
                if (error) rej(error);
                else res(result);
              })
              .end(file.buffer);
          });
          imageUrls.push(uploadRes.secure_url);
        }
    }
        return imageUrls;
}