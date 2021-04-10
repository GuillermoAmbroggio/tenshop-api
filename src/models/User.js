const { DataTypes } = require('sequelize');
const crypto = require('crypto') //npm i --save sequelize crypto
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('user', {
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,      
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false,        
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,        
    },
    password: {
      type: DataTypes.STRING,
      allowNull:false,
      get() {
          return () => this.getDataValue('password')
      }
     },
    salt: {
      type: DataTypes.STRING,
      get() {
          return() => this.getDataValue('salt')
      }
    },
    type: {
      type: DataTypes.ENUM("1", "2", "3"),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type:DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    statusemail: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: true,
    },
    googleId: {
      type:DataTypes.STRING
    }   
  });
  
};