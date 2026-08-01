require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/claims", require("./routes/claimRoutes"));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT , () => {
      console.log(`Server running on port http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database Connection Error");
    console.log(err.message);
  });