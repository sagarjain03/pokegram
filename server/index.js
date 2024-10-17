require('dotenv').config();
const express = require("express")
const cors = require("cors");
const app = express();
const connectDB = require("./utils/db");
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT;

app.use(express.json())

app.use(cookieParser)
app.use(express.urlencoded({extended:true}))

const corsOption = {
  origin :"http://localhost:5173",
  credentials:true
}
app.use(cors(corsOption))


app.get("/",(req,res)=>{
  res.send("hello world");
})

app.listen(PORT,()=>{
  connectDB()
  console.log(`running at port ${PORT}`);
  
})
