const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const listRoutes = require("./routes/listRoutes");
const userRoutes = require("./routes/userRoutes");
const emailRoutes = require("./routes/emailRoutes");

dotenv.config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.send("ALL API can be tested via POSTMAN , shared the link");
});
app.use("/lists", listRoutes);
app.use("/users", userRoutes);
app.use("/emails", emailRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
