'use strict';
module.exports = (sequelize, DataTypes) => {
  const owner = sequelize.define('owner', {
      owner_id:{type:DataTypes.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
      },
      vehicle_id:{
        type: DataTypes.BIGINT,
        references:{
            model:"vehicle",
            key:"vehicle_id"

        }
      },
      user_id:{
          type: DataTypes.BIGINT,
          references:{
              model:"users",
              key:"user_id"

          }
      },
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      pincode: DataTypes.DOUBLE,
      state:DataTypes.STRING,
      city:DataTypes.STRING,
      mobile_no: DataTypes.DOUBLE,
      email: DataTypes.STRING,
      DOB: DataTypes.DATE,
      documents: DataTypes.STRING

  }, {});
  owner.associate = function(models) {
      owner.hasMany(models.vehicle_transaction,{foreignKey:"owner_id"})
  };
  return owner;
};