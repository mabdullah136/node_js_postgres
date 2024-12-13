const express = require("express");
const cors = require("cors");
const multer = require("multer");
const db = require("./src/config/config");
const userRoutes = require("./src/routes/user/user");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());
app.use(cookieParser());
const upload = multer();

app.use(upload.none());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

db.sync({ force: false }) // `force: true` will drop tables, use with caution
  .then(() => console.log("Database synchronized"))
  .catch((err) => console.error("Error synchronizing database:", err));

app.use("/user", userRoutes);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}.`);
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});
