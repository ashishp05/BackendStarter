const API = require("../utils/apiBuilder");
const { TableFields } = require("../utils/constants");
const ProductController = require("../controllers/product/ProductController");
const router = API.configRoute("/user")

  .addPath("/product/list")
  .asGET(ProductController.listOfProducts)
  .build()

  .addPath(`/product/info/:${TableFields.productId}`)
  .asGET(ProductController.getProductInfo)
  .build() 

  .addPath("/openai/chat")
  .asPOST(ProductController.getOpenAIResponse)
  .build()

  .getRouter();

module.exports = router;
