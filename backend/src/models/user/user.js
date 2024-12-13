const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const db = require("../../config/config");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

User.prototype.generateHash = function (salt, password) {
  return bcrypt.hashSync(salt + password, 10);
};

User.prototype.validPassword = function (salt, password) {
  return bcrypt.compareSync(salt + password, this.password);
};

module.exports = User;
