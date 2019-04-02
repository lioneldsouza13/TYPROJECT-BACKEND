'use strict';
module.exports = (sequelize, DataTypes) => {
  const vehicle = sequelize.define('vehicle', {
      vehicle_id:{
          type:DataTypes.BIGINT,
          autoIncrement: true,
      primaryKey:true
          },
      user_id:DataTypes.BIGINT,
      vehicle_type:DataTypes.STRING,
      brand: DataTypes.STRING,
      model:DataTypes.STRING,
      fuel_type:DataTypes.STRING,
      year: DataTypes.STRING,
      registration_state: DataTypes.STRING,
      km_driven:DataTypes.STRING,
      number_plate: DataTypes.STRING,
      price_per_day: DataTypes.BIGINT,
      description:DataTypes.STRING,
      image: DataTypes.STRING,
      documents: DataTypes.STRING,
      price: DataTypes.BIGINT,
      status:DataTypes.STRING
  },{freezeTableName:true});
  vehicle.associate = function(models) {
    vehicle.hasOne(models.client,{foreignKey:'vehicle_id'})
      vehicle.hasOne(models.owner,{foreignKey:'vehicle_id'})
      // vehicle.hasOne(models.user,{foreignKey:'vehicle_id'})
       vehicle.hasMany(models.feedback,{foreignKey:'vehicle_id'})
      vehicle.hasMany(models.rating,{foreignKey:'vehicle_id'})

      vehicle.hasMany(models.vehicle_transaction,{foreignKey:'vehicle_id'})
      vehicle.hasMany(models.accessory_transaction,{foreignKey:'vehicle_id'})
      vehicle.hasMany(models.avg_rating_vehicles,{foreignKey:"vehicle_id"})


  };
  return vehicle;
};