const {
  TableFields,
  ValidationMsgs,
  ProductTag,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Product = require("../models/product");
const { MongoUtil } = require("../mongoose");

class ProductService {
  static insertRecord = async (productData) => {
    let product = new Product({
      ...productData,
    });
    try {
      await product.save();
      return product;
    } catch (error) {
      throw error;
    }
  };

  static getProductById = (productId) => {
    return new ProjectionBuilder(async function () {
      return Product.findById(productId, this);
    });
  };

  static updateProduct = async (productId, productData) => {
    let record = await Product.updateOne(
      {
        [TableFields.ID]: MongoUtil.toObjectId(productId),
      },
      {
        ...productData,
        [TableFields.productDetails]: productData[TableFields.productDetails],
        [TableFields._updatedAt]: Date.now(),
      },
      {
        new: false,
        projection: { [TableFields.ID]: 1 },
      }
    );

    if (!record) throw new ValidationError(ValidationMsgs.RecordNotFound);
  };

  static listProducts = (filter = {}) => {
    return new ProjectionBuilder(async function () {
      let limit = filter.limit || 0;
      let skip = filter.skip || 0;
      let sortKey = filter.sortKey || TableFields._createdAt;
      let sortOrder = filter.sortOrder || -1;
      let needCount = Util.parseBoolean(filter.needCount);
      let startDate = filter.startDate;
      let endDate = filter.endDate;
      let tag = filter.tag;

      let searchQuery = {};

      let searchTerm = filter.searchTerm;
      if (searchTerm) {
        searchQuery["$or"] = [
          {
            [TableFields.name_]: {
              $regex: Util.wrapWithRegexQry(searchTerm),
              $options: "i",
            },
          },
          {
            [TableFields.productDetails + "." + TableFields.brand]: {
              $regex: Util.wrapWithRegexQry(searchTerm),
              $options: "i",
            },
          },
        ];
      }

      if (startDate && endDate) {
        startDate = new Date(startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999);
        searchQuery[TableFields._createdAt] = {
          $gte: startDate,
          $lte: endDate,
        };
      }
      if (tag) {
        tag = parseInt(tag);
  
        switch (tag) {
          case ProductTag.Laptop:
            searchQuery[TableFields.tag] = ProductTag.Laptop;
            break;
          case ProductTag.computer:
            searchQuery[TableFields.tag] = ProductTag.computer;
            break;
          case ProductTag.tablet:
            searchQuery[TableFields.tag] = ProductTag.tablet;
            break;
          case ProductTag.apple:
            searchQuery[TableFields.tag] = ProductTag.apple;
            break;
          case ProductTag.server:
            searchQuery[TableFields.tag] = ProductTag.server;
            break;
          case ProductTag.other:
            searchQuery[TableFields.tag] = ProductTag.other;
            break;

          default:
            break;
        }
      }

      return await Promise.all([
        needCount ? Product.countDocuments(searchQuery) : undefined,
        Product.find(searchQuery, this)
          .limit(parseInt(limit))
          .skip(parseInt(skip))
          .sort({ [sortKey]: parseInt(sortOrder) }),
      ]).then(([total, records]) => ({ total, records }));
    });
  };

  static removeProduct = async (productId) => {
    return await Product.deleteOne({[TableFields.ID] : MongoUtil.toObjectId(productId)})
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
      projection[TableFields.productDetails] = 1;
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
