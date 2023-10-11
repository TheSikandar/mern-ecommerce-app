import express from "express";
import {
    registerController, 
    loginController, 
    testController,
    forgotPasswordController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController
}
 from "../controllers/authController.js"
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
//router obj

const router = express.Router()

//routing
//REGISTER || METHOD POST
router.post("/register", registerController)

//LOGIN || POST
router.post("/login", loginController)
//forgot password || POST
router.post("/forgot-password", forgotPasswordController)

//router test
router.get("/test", requireSignIn, isAdmin, testController)

//protected User route Auth
router.get("/user-auth", requireSignIn, (req,res) =>{
    res.status(200).send({ok:true});
});

//protected Admin route Auth
router.get("/admin-auth", requireSignIn, isAdmin, (req,res) =>{
    res.status(200).send({ok:true});
});

//update profile
router.put("/profile", requireSignIn, updateProfileController)
//orders
router.get("/orders", requireSignIn, getOrdersController)
//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController)
// order status update
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController)
export default router