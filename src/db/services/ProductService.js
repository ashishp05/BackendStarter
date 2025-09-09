const { TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Product = require("../models/product");
const { MongoUtil } = require("../mongoose");

class ProductService {
  
    static insertRecord = async (productData) =>{

        let product = new Product({
            ...productData
        })
        try {
           await product.save()
           return product
        } catch (error) {
          throw error
        }
    }

    static getProductById = (productId) =>{
      return new ProjectionBuilder(async function(){
        return Product.findById(productId , this)
      })
    }

    static updateProduct = async (productId ,productData) => {
        
           let record =  await Product.updateOne({
              [TableFields.ID] : MongoUtil.toObjectId(productId)
            }, {
              ...productData,
               [TableFields.productDetails] : productData[TableFields.productDetails  ],
              [TableFields._updatedAt] :Date.now()
            },{
                new: false,
                projection: { [TableFields.ID]: 1 },
            }) 

            if(!record)
              throw new ValidationError(ValidationMsgs.RecordNotFound)
        
    }

}


const ProjectionBuilder = class {
  constructor(methodToExecute) {
    const projection = {};

    this.withBasicInfo = () => {
      projection[TableFields.name_] = 1;
      projection[TableFields.ID] = 1;
      projection[TableFields.description] = 1;
      projection[TableFields.price] = 1;
      projection[TableFields.tag] = 1;
      return this;
    };
    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };

    this.withActive = () => {
      projection[TableFields.active] = 1;
      return this;
    };

    this.withDetailInfo = () => {
      projection[TableFields.brand] = 1;
      projection[TableFields.processor] = 1;
      projection[TableFields.storage] = 1;
      projection[TableFields.display] = 1;
      projection[TableFields.os] = 1;
      projection[TableFields.connectionTypes] = 1;
      projection[TableFields.weight] = 1;
      projection[TableFields.RAM] = 1;
      projection[TableFields.graphics] = 1;
      return this;
    };

    this.withImages = () => {
      projection[TableFields.images] = 1;
      return this;
    };

    this.withTimeStamps = () => {
      projection[TableFields._createdAt] = 1;
      projection[TableFields._updatedAt] = 1;
      return this;
    };

    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};
module.exports = ProductService;
