require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./utils/db");
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not defined
const userRoute = require("./routes/user.route");

app.use(express.json());
app.use(cookieParser()); // Call as a function
app.use(express.urlencoded({ extended: true }));

const corsOption = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOption));

app.use("/api/v1/user", userRoute);

const startServer = async () => {
  try {
    await connectDB(); // Connect to the database
    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
};

startServer();
