const ProductService = require("../../db/services/ProductService");
const { TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.addProduct = async (req) => {
  return await parseAndValidateProductDetails(
    req.body,
    undefined,
    async (updatedFiled) => {
      const createdProduct = await ProductService.insertRecord(updatedFiled);

      if (!createdProduct)
        throw new ValidationError(ValidationMsgs.InsertError);
    }
  );
};
 
exports.editProduct = async (req) => {
    const productId = req.params[TableFields.productId];
    if(!productId)
        throw new ValidationError(ValidationMsgs.ParameterError)

    const product = await ProductService.getProductById(productId).execute()
    
    if(!product)
        throw new ValidationError(ValidationMsgs.ProductNotFound)


    return  parseAndValidateProductDetails(req.body , product ,async (updatedFields) =>{
      return await ProductService.updateProduct(productId , updatedFields)
    } )



}

async function parseAndValidateProductDetails(
  reqBody,
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
    let productDetails = reqBody[TableFields.productDetails] || {} ;
    let response = await onValidationCompleted({
      [TableFields.name_]: reqBody[TableFields.name_],
      [TableFields.images]:  ["https://res.cloudinary.com/dzc2ezwep/image/upload/v1757398961/products/bycjxfutvcqoy2jglu0w.jpg",
    "https://res.cloudinary.com/dzc2ezwep/image/upload/v1757398963/products/lmi9i9kk6ump9fo5cy8n.jpg"],
      [TableFields.description]: reqBody[TableFields.description],
      [TableFields.tag]: reqBody[TableFields.tag],
      [TableFields.productDetails]: {
        [TableFields.brand]: productDetails[TableFields.brand] || undefined,
        [TableFields.processor]: productDetails[TableFields.processor] || undefined,
        [TableFields.RAM]: productDetails[TableFields.RAM] || undefined,
        [TableFields.display]: productDetails[TableFields.display] || undefined,
        [TableFields.storage]: productDetails[TableFields.storage] || undefined,
        [TableFields.graphics]: productDetails[TableFields.graphics] || undefined,
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
