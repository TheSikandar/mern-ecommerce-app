import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModels from "../models/userModels.js";
import orderModels from "../models/orderModels.js";
import JWT from "jsonwebtoken";

export const registerController = async (req,res) =>{
    try {
        const {name,email,password,phone,address,answer} = req.body;
        //validations
        if(!name){
            return res.send({message:"Name is Required"});
        }
        if(!email){
            return res.send({message:"Email is Required"});
        }
        if(!password){
            return res.send({message:"Password is Required"});
        }
        if(!phone){
            return res.send({message:"Phone is Required"});
        }
        if(!address){
            return res.send({message:"Address is Required"});
        }
        if(!answer){
            return res.send({message:"Answer is Required"});
        }
        //check user
        const existingUser = await userModels.findOne({email});
        //exisiting user
        if(existingUser){
            return res.status(200).send({
                success:false,
                message:"Already Register please login",
            });
        }
        //register user
        const hashedPassword = await hashPassword(password);
        //save
        const user = await new userModels({
            name,
            email,
            password:hashedPassword,
            phone,
            address,
            answer,
        }).save();

        res.status(201).send({
            success: true,
            message: "User Register SuccessFul",
            user,
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in Registration",
            error,
        });
    }
};

//POST LOGIN
export const loginController = async (req,res) =>{
    try {
        const {email,password} = req.body;
        //validation
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:"Invalid email or password"
            });
        }
        //check user
        const user = await userModels.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:"Email is Not Registered"
            });
        }
        const match = await comparePassword(password,user.password);
        if(!match){
            return res.status(200).send({
                success:false,
                message:"Invalid Password"
            });
        }
        //Token
        const token = await JWT.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn:"14d",});
        res.status(200).send({
            success:true,
            message:"login successfully",
            user:{
                _id: user._id,
                name:user.name,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in login",
            error,
        });
    }
};

//forgotPasswordController

export const forgotPasswordController = async (req,res) => {
    try {
        const {email,answer,newPassword} = req.body;
        if(!email){
            res.status(400).send({message: "Email is required!"});
        }
        if(!answer){
            res.status(400).send({message: "answer is required!"});
        }
        if(!newPassword){
            res.status(400).send({message: "New Password is required!"});
        }
        //check
        const user = await userModels.findOne({email,answer});
        //validation
        if(!user){
            return res.status(404).send({
                success:false,
                message:"Wrong Email and Answer",
            });
        }
        const hashed = await hashPassword(newPassword)
        await userModels.findByIdAndUpdate(user._id, {password:hashed});
        res.status(200).send({
            success:true,
            message: "Password Reset Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Something went wrong",
            error
        })
    }
}
//test controller
export const testController = (req, res) => {
    try {
      res.send("Protected Routes");
    } catch (error) {
      console.log(error);
      res.send({ error });
    }
  };


  //update profile
  export const updateProfileController = async (req,res) => {
    try {
        const { name, email, phone, address,password} = req.body;
        const user = await userModels.findById(req.user._id);
        //password check
        if(password && password.length < 6){
            return res.json({error: 'Password is required and 6 character long'});
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModels.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password:hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address,
        }, 
        {new:true}
        );
        res.status(200).send({
            success:true,
            message:"Profile Updated SuccessFully",
            updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(404).send({
            success:false,
            message:"Error While Updating Profile",
            error,
        });
    }
  };
  //orders
  export const getOrdersController = async (req,res) => {
    try {
        const orders = await orderModels
        .find({buyer:req.user._id})
        .populate("products","-photo")
        .populate("buyer","name");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error While Getting Orders",
            error,
        });
    }
  };
  //all orders
  export const getAllOrdersController = async (req,res) => {
    try {
        const orders = await orderModels
        .find({})
        .populate("products","-photo")
        .populate("buyer","name")
        .sort({createdAt: "-1"});
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message: "Erroe While Getting All Orders",
            error,
        });
    }
  };
  // order status update
  export const orderStatusController = async (req,res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModels.findByIdAndUpdate(orderId, {status}, {new:true});
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error While Updating Order",
            error,
        });
    }
  };

