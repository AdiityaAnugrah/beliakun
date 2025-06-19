// models/newsletterModel.js
module.exports = (sequelize, DataTypes) => {
  const Newsletter = sequelize.define("Newsletter", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
  });

  return Newsletter;
};
