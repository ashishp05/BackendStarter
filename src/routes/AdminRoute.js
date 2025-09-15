const API = require("../utils/apiBuilder");
const ImageHandler = require("../middleware/imageVerifier");
const { TableFields } = require("../utils/constants");
const AdminController = require("../controllers/admin/AdminController");
const CmsController = require("../controllers/admin/CmsController");
const FaqController = require("../controllers/admin/FaqController");
const DefaultController = require("../controllers/admin/DefaultController");
const ProductController = require("../controllers/product/ProductController");
const router = API.configRoute("/admin")

  //AUTH
  .addPath("/signup")
  .asPOST(AdminController.addAdminUser)
  .build()

  .addPath("/login")
  .asPOST(AdminController.login)
  .build()

  .addPath("/logout")
  .asPOST(AdminController.logout)
  .useAdminAuth()
  .build()

  .addPath("/password/forgot")
  .asPOST(AdminController.forgotPassword)
  .build()

  .addPath("/password/reset")
  .asPOST(AdminController.resetPassword)
  .build()

  .addPath("/password/change")
  .asUPDATE(AdminController.changePassword)
  .useAdminAuth()
  .build()

  //Dashboard
  .addPath("/dashboard/counts")
  .asGET(AdminController.dashboardCounts)
  .useAdminAuth()
  .build()

  //cms
  .addPath("/edit-privacy-policy")
  .asPOST(CmsController.editPrivacyPolicy)
  .useAdminAuth()
  .build()

  .addPath("/edit-terms-conditions")
  .asPOST(CmsController.editTermsAndConditions)
  .useAdminAuth()
  .build()

  .addPath("/edit-contact-us")
  .asPOST(CmsController.editContactUs)
  .useAdminAuth()
  .build()

  .addPath("/privacy-policy")
  .asGET(CmsController.getPrivacyPolicy)
  .build()

  .addPath("/contact-us")
  .asGET(CmsController.getContactUs)
  .build()

  .addPath("/terms-conditions")
  .asGET(CmsController.getTermsAndConditions)
  .build()

  //faq
  .addPath("/faq/list")
  .asGET(FaqController.listFaq)
  .build()

  .addPath("/faq/add")
  .asPOST(FaqController.addFaq)
  .useAdminAuth()
  .build()

  .addPath(`/faq/update/:${TableFields.ID}`)
  .asUPDATE(FaqController.updateFaq)
  .useAdminAuth()
  .build()

  .addPath(`/faq/delete/:${TableFields.ID}`)
  .asDELETE(FaqController.deleteFaq)
  .useAdminAuth()
  .build()

  /**
   * -------------------------------------
   * App Settings Route
   * -------------------------------------
   */
  .addPath("/app-settings")
  .asUPDATE(DefaultController.updateAppSettings)
  .useAdminAuth()
  .build()

  .addPath("/app-settings")
  .asGET(DefaultController.getAppSettings)
  .useAdminAuth()
  .build()

  /**
   * -------------------------------------
   * ClockOut Reasons Route
   * -------------------------------------
   */
  .addPath("/seed/clock-out-reason")
  .asPOST(DefaultController.seedClockOutReasons)
  .build()

  .addPath("/add/clock-out-reason")
  .asPOST(DefaultController.addClockedOutReason)
  .build()

  .addPath("/clock-out-reason")
  .asGET(DefaultController.getClockOutReasons)
  .build()

  .addPath(`/clock-out-reason/:${TableFields.ID}`)
  .asUPDATE(DefaultController.updateClockOutReasons)
  .useAdminAuth()
  .build()

  .addPath(`/clock-out-reason/:${TableFields.ID}`)
  .asDELETE(DefaultController.deleteClockOutReasons)
  .useAdminAuth()
  .build()

  /**
   * -------------------------------------
   * Device Speed settings
   * -------------------------------------
   */
  .addPath("/device-speed-movement")
  .asUPDATE(DefaultController.updateDeviceMovement)
  .useAdminAuth()
  .build()

  .addPath("/device-speed-movement")
  .asGET(DefaultController.getDeviceMovement)
  .useAdminAuth()
  .build()

  /**
   * -------------------------------------
   * Product CURD
   * -------------------------------------
   */
  
  .addPath("/product/add")
  .asPOST(ProductController.createProductWithImages)
  .userMiddlewares(ImageHandler.multipleImage([TableFields.images]))
  .useAdminAuth()
  .build()
 
  .addPath(`/product/edit/:${TableFields.productId}`)
  .asUPDATE(ProductController.editProduct)
  .useAdminAuth()
  .build()

  .addPath("/product/list")
  .asGET(ProductController.listOfProducts)
  .useAdminAuth()
  .build()

  .addPath(`/product/info/:${TableFields.productId}`)
  .asGET(ProductController.getProductInfo)
  .useAdminAuth()
  .build()
  
  .addPath(`/product/delete/:${TableFields.productId}`)
  .asDELETE(ProductController.deleteProdut)
  .useAdminAuth()
  .build()

  .getRouter();

module.exports = router;
