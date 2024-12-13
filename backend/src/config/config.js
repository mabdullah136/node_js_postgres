require("dotenv").config();
const { Sequelize } = require("sequelize");

const db = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: "postgres",
    logging: false, // Disable query logging
  }
);

db.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = db;
