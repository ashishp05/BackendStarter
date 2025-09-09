const { default: mongoose } = require("mongoose");
const { TableFields, TableNames, OrderStatus } = require("../../utils/constants");

const orderSchema = new mongoose.Schema({
  [TableFields.userId]: {
    type: mongoose.Schema.Types.ObjectId,
    ref: TableNames.Admin,
  },
  [TableFields.items]: [
    {
      _id: false,
      [TableFields.productId]: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableNames.Product,
      },
      [TableFields.qty]: {
        type: Number,
        default: 1,
      },
      [TableFields.name]: {
        type: String,
        trim: true,
      },
      [TableFields.price]: {
        type: String,
        trim: true,
      },
    },
  ],
  [TableFields._createdAt] : {
    type : Date ,
    default : Date.now
  },
  [TableFields._updatedAt] : {
     type : Date ,
    default : Date.now
  },
  [TableFields.status] : {
    type : String,
    enum : Object.values(OrderStatus.Pending)
  }
}, {
    timestamps : false, 
    toJSON : {
        transform : function (doc , ret)
        {
            delete ret.__v;
        }
    }
});

