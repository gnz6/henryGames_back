const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('videogame', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    },
    released:{
      type: DataTypes.STRING
    },
    rating:{
      type: DataTypes.FLOAT
    },
    platforms:{
      type: DataTypes.JSON,
      allowNull: false
    },
    image:{
    type: DataTypes.STRING,
    },
  
    createdInDb:{
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue: true
    }
    },
  {
    timestamps: false
  });
};
