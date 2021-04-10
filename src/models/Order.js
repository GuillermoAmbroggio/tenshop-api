const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("order", {      
    status: {
      type: DataTypes.ENUM("created", "processing", "cancelled", "complete"),
    },
    total_price: {
      type: DataTypes.INTEGER
    },
    address: {
      type: DataTypes.TEXT
    },    
  })

/* const queryInterface = sequelize.getQueryInterface();
queryInterface.addColumn('productsxorders','amountt',{type: DataTypes.INTEGER}) 

 */
}