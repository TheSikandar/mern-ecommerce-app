import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import path, { path } from "path";
//configure env
dotenv.config();

//database config
connectDB();
//rest obj
const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './clients/build')));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

//rest api
app.use('*', function(req,res){
    res.sendFile(path.join(__dirname, './clients/build/index.html'));
})
// app.get("/", (req,res) =>{
//     res.send("<h1>Welcome to techinfo yt</h1>");
// })

//PORT
const PORT = process.env.PORT || 8080;

//listen

app.listen(PORT, () =>{
    console.log(`Server Running on ${PORT}`.bgCyan.white);
});

