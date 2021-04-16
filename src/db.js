require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;

const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  }
);
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });
// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const {
  Product,
  Category,
  categoryxproduct,
  User,
  Order,
  Productsxorders,
  Reviews,
} = sequelize.models;

// Aca vendrian las relaciones

Product.belongsToMany(Category, {
  through: "categoriesxproducts",
  foreignKey: "product_id",
  otherKey: "category",
});
Category.belongsToMany(Product, {
  through: "categoriesxproducts",
  foreignKey: "category",
  otherKey: "product_id",
});

Order.belongsTo(User);
Order.belongsToMany(Product, {
  through: "productsxorders",
  foreignKey: "order_id",
  otherKey: "product_id",
});
Product.belongsToMany(Order, {
  through: "productsxorders",
  foreignKey: "product_id",
  otherKey: "order_id",
});

Product.hasMany(Reviews);
Reviews.belongsTo(User);

//belongsTo: PERTENECE A
//belongsToMany: PERTENECE A MUCHOS
//hasMany: TIENE MUCHOS
//hasOne: TIENE UNO
//through: MEDIANTE

// // Product.belongsToMany(Category, { as: "idCategory" })
// // Category.belongsToMany(Product, { as: "idProduct" })
// Product.belongsTo(Categories, {as:"categoria"});
// User.hasMany(Order, { as: 'orders' });
// Product.belongsToMany(Order, { through: OrderDetail });
// Order.belongsToMany(Product, { through: OrderDetail });
// Product.hasMany(Reviews, { as: 'reviews' });
// User.hasMany(Reviews, { as: 'reviews' });
// Reviews.belongsTo(Product, { as: 'product' });
// Reviews.belongsTo(User, { as: 'User' });
// Order.belongsTo(User, { as: 'User' });
// Product.belongsToMany(Category, { through: "categoriesxproducts" });
// Category.belongsToMany(Product, { through: "categoriesxproducts" });

// Category.hasMany(Product,{as:"idProduct", foreignKey: "Category"})
// Category.belongsToMany(Product, { through: 'categoryxproduct', sourceKey: 'idCategory', targetKey: 'idProduct' });

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
