import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

//Conncet database
connectDB();

app.listen(PORT,()=>{
    console.log(`Server is running in ${process.env.NODE_ENV} node on port ${PORT}`);
});