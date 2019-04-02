'use strict';
module.exports = (sequelize, DataTypes) => {
  const client = sequelize.define('client', {
    client_id:{type:DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
     vehicle_id:{
        type:DataTypes.BIGINT,
         references: {
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
    address: DataTypes.STRING,
    name: DataTypes.STRING,
    city: DataTypes.STRING,
    state:DataTypes.STRING,
    pincode: DataTypes.DOUBLE,
    mobile_no: DataTypes.DOUBLE,
    email: DataTypes.STRING,
    DOB: DataTypes.DATE,
    documents: DataTypes.STRING
  });
  client.associate = function(models) {
    client.hasMany(models.vehicle_transaction,{foreignKey:"client_id"})


  };
  return client;
};