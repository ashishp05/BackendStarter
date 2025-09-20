const ProductService = require("../../db/services/ProductService");
const { TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const cloudinary = require("../../utils/cloudinary")

const openAI = require("../../utils/openAI/openAI");
exports.addProduct = async (req) => {
  return await parseAndValidateProductDetails(
    req.body,
    undefined,
    async (updatedFiled) => {
      console.log("updated Fields" , updatedFiled)
      const createdProduct = await ProductService.insertRecord(updatedFiled);

      if (!createdProduct)
        throw new ValidationError(ValidationMsgs.InsertError);
    }
  );
};

exports.createProductWithImages = async (req) => {
    try {
        const { files, body } = req;
        console.log("files" , files)

        // Upload images to Cloudinary concurrently 
        const uploadImagePromises = (files || []).map(file => 
            new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream({ folder: "products" }, (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    })
                    .end(file.buffer);
            })
        );

        const imageUrls = await Promise.all(uploadImagePromises);

        // Use your existing parseAndValidateProductDetails function
        const createdProduct = await parseAndValidateProductDetails(
            body,
            imageUrls,
            async (updatedFields) => {
                const product = await ProductService.insertRecord(updatedFields);
                if (!product) {
                    throw new ValidationError(ValidationMsgs.InsertError);
                }
                return product;
            }
        );

        return {
            product: createdProduct,
            message: "Product created successfully with images"
        };

    } catch (error) {
        console.error("Error in createProductWithImages:", error);
        
        if (error.name === 'ValidationError') {
            throw error;
        }
        
        throw new Error(`Failed to create product: ${error.message}`);
    }
};
exports.editProduct = async (req) => {
  const productId = req.params[TableFields.productId];
  if (!productId) throw new ValidationError(ValidationMsgs.ParameterError);

  const product = await ProductService.getProductById(productId).execute();

  if (!product) throw new ValidationError(ValidationMsgs.ProductNotFound);

  return parseAndValidateProductDetails(
    req.body,
    product,
    async (updatedFields) => {
      return await ProductService.updateProduct(productId, updatedFields);
    }
  );
};

exports.listOfProducts = async (req) => {
  return await ProductService.listProducts(req.query).withBasicInfo().withImages().execute();
};

exports.getProductInfo = async (req) => {
  const product = await ProductService.getProductById(
    req.params[TableFields.productId]
  )
    .withBasicInfo()
    .withDetailInfo()
    .withImages()
    .withActive()
    .execute();

  if (!product) throw new ValidationError(ValidationMsgs.RecordNotFound);

  return product 
};

exports.getOpenAIResponse = async (req) =>{
   const response =await openAI.gptModel(req.body[TableFields.message])
   
  return response
}


exports.deleteProdut = async ( req) =>{
   return await ProductService.removeProduct(req.params[TableFields.productId])
}

async function parseAndValidateProductDetails(
  reqBody,
  images,
  existingProduct = {},
  onValidationCompleted = async (updatedFiled) => {}
) {
  //Text fields validations
  if (
    isFieldEmpty(reqBody[TableFields.name_], existingProduct[TableFields.name_])
  ) {
    throw new ValidationError(ValidationMsgs.NameEmpty);
  }
  if (
    isFieldEmpty(reqBody[TableFields.tag], existingProduct[TableFields.tag])
  ) {
    throw new ValidationError(ValidationMsgs.TagEmpty);
  }
  if (
    isFieldEmpty(
      reqBody[TableFields.description],
      existingProduct[TableFields.description]
    )
  )
    throw new ValidationError(ValidationMsgs.DescEmpty);
  try {
    console.log(images)
    let productDetails = reqBody[TableFields.productDetails] || {};
    let response = await onValidationCompleted({
      [TableFields.name_]: reqBody[TableFields.name_],
      [TableFields.images]:images || [
        "https://res.cloudinary.com/dzc2ezwep/image/upload/v1757398961/products/bycjxfutvcqoy2jglu0w.jpg",
        "https://res.cloudinary.com/dzc2ezwep/image/upload/v1757398963/products/lmi9i9kk6ump9fo5cy8n.jpg",
      ],
      [TableFields.description]: reqBody[TableFields.description],
      [TableFields.tag]: reqBody[TableFields.tag],
      [TableFields.price] : reqBody[TableFields.price],
      [TableFields.productDetails]: {
        [TableFields.brand]: productDetails[TableFields.brand] || undefined,
        [TableFields.processor]:
          productDetails[TableFields.processor] || undefined,
        [TableFields.RAM]: productDetails[TableFields.RAM] || undefined,
        [TableFields.display]: productDetails[TableFields.display] || undefined,
        [TableFields.storage]: productDetails[TableFields.storage] || undefined,
        [TableFields.graphics]:
          productDetails[TableFields.graphics] || undefined,
        [TableFields.weight]: productDetails[TableFields.weight] || undefined,
        [TableFields.connectionTypes]:
          productDetails[TableFields.connectionTypes] || undefined,
        [TableFields.os]: productDetails[TableFields.os] || undefined,
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
}

function isFieldEmpty(providedField, existingField) {
  if (providedField != undefined) {
    //If new field provided in "req" then validate it
    if (providedField) {
      //Check => "Is New field NOT empty"
      return false;
    }
  } else if (existingField) {
    //If new field is not provided in "req" then check the existing field=> "Is Existing field NOT empty"
    return false;
  }
  return true;
}



exports.createProductWithImages = async (req) => {
    try {
        const { files, body } = req;

        // Upload images to Cloudinary concurrently
        const uploadImagePromises = (files || []).map(file => 
            new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream({ folder: "products" }, (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    })
                    .end(file.buffer);
            })
        );

        const imageUrls = await Promise.all(uploadImagePromises);

        // Use your existing parseAndValidateProductDetails function
        const createdProduct = await parseAndValidateProductDetails(
            body,
            imageUrls,
            async (updatedFields) => {
                const product = await ProductService.insertRecord(updatedFields);
                if (!product) {
                    throw new ValidationError(ValidationMsgs.InsertError);
                }
                return product;
            }
        );

        return {
            product: createdProduct,
            message: "Product created successfully with images"
        };

    } catch (error) {
        console.error("Error in createProductWithImages:", error);
        
        if (error.name === 'ValidationError') {
            throw error;
        }
        
        throw new Error(`Failed to create product: ${error.message}`);
    }
};