
import slugify from "slugify";
import productModels from "../models/productModels.js";
import categoryModels from "../models/categoryModels.js";
import orderModels from "../models/orderModels.js";
import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});
export const createProductController = async (req,res) => {
    try {
        const {name,slug,description,price,category,quantity,shiping} = req.fields;
        const {photo} = req.files;
        //validation
        switch(true){
            case !name:
                return res.status(500).send({error: 'Name is required'});
            case !description:
                return res.status(500).send({error: 'Description is required'});
            case !price:
                return res.status(500).send({error: 'Price is required'});
            case !category:
                return res.status(500).send({error: 'Category is required'});
             case !quantity:
                return res.status(500).send({error: 'Quantity is required'});
             case photo && photo.size > 1000000:
                return res.status(500).send({error: 'photo is required and should be less then 1mb'});
        }
        const products = new productModels({...req.fields, slug:slugify(name)});
        if(photo){
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success:true,
            message:"Product created successfully",
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error creating product",
        });
    }
};
//get all product
export const getProductController = async (req,res) =>{
    try {
        const products = await productModels
        .find({})
        .populate("category")
        .select("-photo")
        .limit(120)
        .sort({createdAt:-1});
        res.status(200).send({
            success:true,
            counTotal:products.length,
            message:"All Products",
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error: error.message,
            message:"Error in getting products",
        });
    }
};
//get single product
export const getSingleProductController = async (req,res) =>{
    try {
        const product = await productModels
        .findOne({slug:req.params.slug})
        .select("-photo")
        .populate("category");
        res.status(200).send({
            success:true,
            message:"Single Products Fetched",
            product,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error while getting single product",
            error,
        });
    }
};
//get photo
export const productPhotoController = async (req,res) =>{
    try {
        const product = await productModels.findById(req.params.pid).select("photo")
        if(product.photo.data){
            res.set("Content-type", product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error while getting product photo",
            error,
        });
    }
};
//delete product
export const deleteProductController = async (req,res) =>{
    try {
        await productModels.findByIdAndDelete(req.params.pid).select("-photo")
        res.status(200).send({
            success:true,
            message:"product delete successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error while delete product",
            error,
        });
    }
};
//update product
export const updateProductController = async (req,res) => {
    try {
        const {name,slug,description,price,category,quantity,shiping} = req.fields;
        const {photo} = req.files;
        //validation
        switch(true){
            case !name:
                return res.status(500).send({error: 'Name is required'});
            case !description:
                return res.status(500).send({error: 'Description is required'});
            case !price:
                return res.status(500).send({error: 'Price is required'});
            case !category:
                return res.status(500).send({error: 'Category is required'});
             case !quantity:
                return res.status(500).send({error: 'Quantity is required'});
             case photo && photo.size > 1000000:
                return res.status(500).send({error: 'photo is required and should be less then 1mb'});
        }
        const products = await productModels.findByIdAndUpdate(req.params.pid, 
            {...req.fields, slug:slugify(name)}, {new:true}
            );
        if(photo){
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success:true,
            message:"Product updated successfully",
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error updating product",
        });
    }
};
//filters
export const productFiltersController = async (req,res)=> {
    try {
        const { checked, radio} = req.body;
        let args = {}
        if(checked.length > 0)args.category = checked;
        if(radio.length)args.price = {$gte: radio[0], $lte: radio[1] };
        const products = await productModels.find(args);
        res.status(200).send({
            success:true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(404).send({
            success:false,
            message:"Error While Filtering Product",
            error,
        });
    }
};
//product count
export const productCountController = async (req,res) => {
    try {
       const total = await productModels.find({}).estimatedDocumentCount();
       res.status(200).send({
        success:true,
        total,
       }); 
    } catch (error) {
        console.log(error);
        res.status(404).send({
            success:false,
            message:"Error while Product Count",
            error,
        });
    }
};
//product list based on page
export const productListController = async (req,res) => {
    try {
        const perPage = 2
        const page = req.params.page ? req.params.page : 1
        const products = await productModels
        .find({})
        .select("-photo")
        .skip((page-1) * perPage)
        .limit(perPage).sort({ createdAt: -1 });
        res.status(200).send({
            success:true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(404).send({
            success:false,
            message:"Error in per page ctrlt",
            error,
        });
    }
};
//search product
export const searchProductController = async (req, res) => {
    try {
      const { keyword } = req.params;
      const resutls = await productModels
        .find({
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        })
        .select("-photo");
      res.json(resutls);
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error In Search Product API",
        error,
      });
    }
  };
  //similar product
  export const relatedProductController = async (req, res) => {
    try {
        const {pid, cid} = req.params
        const products = await productModels.find({
            category:cid,
            _id:{$ne:pid}
        }).select("-photo").limit(2).populate("category");
        res.status(200).send({
            success:true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(404).send({
            success:false,
            message:"Error while getting related product",
            error,
        });
    }
  };
  
  //get product by category
  export const productCategoryController = async (req,res) => {
    try {
        const category = await categoryModels.findOne({slug:req.params.slug});
        const products = await productModels.find({category}).populate('category');
        res.status(200).send({
            success: true,
            category,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(404).send({
            success:false,
            message:"Error while getting product",
            error,
        });
    }
  };
  //payment getway api
  //token
  export const braintreeTokenController =async (req, res) => {
    try {
        gateway.clientToken.generate({}, function(err, response){
            if(err){
                res.status(500).send(err);
            }else{
                res.send(response);
            }
        });
    } catch (error) {
        console.log(error);
    }
  };
  //payment
  export const braintreePaymentController =async (req, res) => {
    try {
       const {cart, nonce} = req.body;
       let total = 0;
       cart.map((i) => {
        total += i.price;
       });
       let newTransaction = gateway.transaction.sale({
        amount:total,
        paymentMethodNonce: nonce,
        options:{
            submitForSettlement:true,
        },
       },
       function(error, resutls){
        if(resutls){
            const order = new orderModels({
                products: cart,
                payment: resutls,
                buyer: req.user._id,
            }).save();
            res.json({ ok: true });
        }else{
            res.status(500).send(error);
        }
       }
       );
    } catch (error) {
        console.log(error);
    }
  };
