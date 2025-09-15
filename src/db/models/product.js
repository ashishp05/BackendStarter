const { default: mongoose } = require("mongoose");
const { TableFields, TableNames, ProductTag } = require("../../utils/constants");

const productSchema = new mongoose.Schema(
  {
    [TableFields.name_]: {
      type: String,
      trim: true,
    },
    [TableFields.tag]: {
      type: Number,
      enum : Object.values(ProductTag),
      trim: true,
    },
    [TableFields.description]: {
      type: String,
      trim: true,
    },
    [TableFields.price]: {
      type: String,
      trim: true,
    },
    [TableFields.images]: [
      {
        _id: false,
        type: String,
        trim: true,
      },
    ],
    [TableFields.productDetails]: {
      _id: false,

      [TableFields.brand]: {
        type: String,
        trim: true,
      },
      [TableFields.processor]: {
        type: String,
        trim: true,
      },
      [TableFields.RAM]: {
        type: String,
        trim: true,
      },
      [TableFields.storage]: {
        type: String,
        trim: true,
      },
      [TableFields.graphics]: {
        type: String,
        trim: true,
      },
      [TableFields.display]: {
        type: String,
        trim: true,
      },
      [TableFields.os]: {
        type: String,
        trim: true,
      },
      [TableFields.connectionTypes]: {
        type: String,
        trim: true,
      },
      [TableFields.weight]: {
        type: String,
        trim: true,
      },
    },
    [TableFields.active]: {
      type: Boolean,
      default: true,
    },
    [TableFields._createdAt]: {
      type: Date,
      default: Date.now,
    },
    [TableFields._updatedAt]: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },
  }
);

const Product = mongoose.model(TableNames.Product, productSchema);

module.exports = Product;
