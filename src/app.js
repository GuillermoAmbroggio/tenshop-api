const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("express-session");
const { Product, Category, Order, User, Reviews } = require("./db.js");
const ind = require("./routes/index");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("./db.js");
const pgSession = require("connect-pg-simple")(session);
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
const sessionPool = require("pg").Pool;

passport.use(
  new LocalStrategy(function (username, password, done, info) {
    db.User.findOne({ where: { username } })
      .then((user) => {
        if (!user) {
          console.log("NO ENCUENTRA EL USUARIO", username);
          return done(null, false);
        }
        if (!user.correctPassword(password)) {
          console.log("NO PASA LA CONTRASEÑA");
          return done(null, false);
        }
        console.log("ENCUENTRA EL USUARIO", user.dataValues);
        return done(null, user.dataValues);
      })
      .catch((err) => {
        return done(err);
      });
  })
);

const server = express();

/* const conObject = {
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST, // or whatever it may be
  port: 5432,
  database: DB_NAME,
}; */

/* const pgStoreConfig = {
  pool: new (require("pg").Pool({
    connectionString: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: process.env.DATABASE_DEV
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
          },
        },
  }))(), // or this
}; */
/* const pgStoreConfig = {
  conString: process.env.DATABASE_DEV
    ? `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`
    : `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?ssl=true`,
}; */

const sessionDBaccess = new sessionPool({
  connectionString: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: process.env.DATABASE_DEV
    ? {}
    : {
        ssl: {
          require: true,
          rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
        },
      },
});

server.use(
  session({
    store: new pgSession({ pool: sessionDBaccess, tableName: "session" }),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: (30 * 24 * 60 * 60 * 1000) / 3 }, // 10 days
  })
);

server.name = "API";

server.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
server.use(bodyParser.json({ limit: "50mb" }));
server.use(cookieParser("keyboard cat"));
server.use(morgan("dev"));
server.use((req, res, next) => {
  //res.header("Access-Control-Allow-Origin", "http://localhost:3000/"); // update to match the domain you will make the request from
  const allowedOrigins = [
    "http://localhost:3000",
    "https://tenshop.vercel.app",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findOne({ where: { id } })
    .then((user) => {
      done(null, user.dataValues);
    })
    .catch((err) => {
      return done(err);
    });
});

server.use(passport.initialize());
server.use(passport.session());

server.use((req, res, next) => {
  console.log("Session! ", req.session);
  console.log("User!", req.user);
  next();
});

server.use("/", ind);

server.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("POST LOGUIN 97", user);
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(user);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.send(user);
    });
  })(req, res, next);
});

server.post("/loginGoogle", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(user);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.send(user);
    });
  })(req, res, next);
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.send("Fail Login, 150");
  }
}

server.get("/login", isAuthenticated, (req, res) => {
  res.send(req.user);
});

server.get("/logout", (req, res) => {
  req.logout();
  res.send("Usuario Desconectado");
});

server.post("/", async (req, res) => {
  const categoria1 = await Category.create({
    name: "Laptops",
    description: "Laptop for work, university or watching Netflix!",
  });
  const categoria2 = await Category.create({
    name: "TV",
    description: "To watch netflix, soccer or your favorite sport.",
  });
  const categoria3 = await Category.create({
    name: "Refrigerators",
    description: "The best refrigerators to keep your food in good condition.",
  });
  const categoria4 = await Category.create({
    name: "Cellphones",
    description: "The best cell phones on the market, at the best price",
  });
  const categoria5 = await Category.create({
    name: "Audio",
    description:
      "In this category you will find the best audio products to enjoy your music, movie and more",
  });
  const producto1 = Product.create({
    name: "Laptop HP i7",
    description:
      "Intel i7 3.0 Ghz, 500gb SSD, 20gb RAM. The best in the market.",
    price: 90000,
    stock: 9,
    image:
      "https://http2.mlstatic.com/D_NQ_NP_945569-MLA31652747525_082019-O.webp",
    image2:
      "https://x-view.com/assets/img/dt/notebooks/novabook/novabook-plegado3.png",
    image3:
      "https://www.cronista.com/__export/1566304459280/sites/revistait/img/2019/08/20/122686_85931.jpg",
    image4:
      "https://tecnologia-informatica.com/wp-content/uploads/2018/12/word-image-140.jpeg",
  });
  const producto2 = Product.create({
    name: "TV Samsung 4K HDR",
    description: "Smart tv 45 inches, guaranteed quality.",
    price: 10000,
    stock: 0,
    image:
      "https://images.samsung.com/is/image/samsung/es-uhd-ku6000-ue55ku6000kxxc-008-side-black?$L2-Thumbnail$",
    image2:
      "https://d2ye0ltusw47tz.cloudfront.net/379072-large_default/tv-led-4k-65-rca-x65andtv-android-tv-fhd-netflix-youtube-tda.jpg",
    image3:
      "https://http2.mlstatic.com/smart-tv-rca-android-50-x50andtv-con-comando-de-voz-D_NQ_NP_790109-MLA32568164311_102019-F.jpg",
    image4:
      "https://images.samsung.com/is/image/samsung/ar-uhdtv-mu6100-un50mu6100gxzd-black-136495500?$PD_GALLERY_L_JPG$",
  });
  const producto3 = Product.create({
    name: "CellPhone Huawei",
    description: "P20 mate, 8gb RAM, 120gb",
    price: 21000,
    stock: 25,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTALbNv80PTObO79eSC8OpHi1EaUmZo6BLlkdXkIs66U7iiUv6zdwr_ahjPWapwCf3vO-ywJyM&usqp=CAc",
    imaga2:
      "https://tiendaste-ka.com/578-large_default/celular-huawei-y9s-precio.jpg",
    image3:
      "https://resources.claroshop.com/medios-plazavip/s2/10487/1297225/5e1a067703a0c-647bb529-4c83-499c-9562-620e258817a0-1600x1600.jpg",
    image4:
      "https://www.laptopshop.com.mx/pub/media/catalog/product/cache/8872124951f387c8ded3f228faa55bea/y/5/y5_neo-_1.jpg",
  });
  const producto4 = Product.create({
    name: "Refrigerator Gama",
    description: "The best refrigerator in the market.",
    price: 65000,
    stock: 5,
    image:
      "https://whirlpoolarg.vteximg.com.br/arquivos/ids/160013-1000-1000/WRM54AK-01.jpg?v=636843652899770000",
    image2:
      "https://www.elitehogar.com.ar/wp-content/uploads/2020/01/heladera-gafa-hgf387awb-D_NQ_NP_640224-MLA31547504771_072019-F.jpg",
    image3:
      "https://argendustria.com.ar/wp-content/uploads/heladera-1-777x437.jpg",
    image4:
      "https://i1.wp.com/culturageek.com.ar/wp-content/uploads/2019/12/Culturageek.com_.ar-Samsung-Heladera-Freezer-Superior-Twin-Cooling-Plus-00.jpg?fit=1000%2C555&ssl=1",
  });
  const producto5 = Product.create({
    name: "CellPhone Xiaomi",
    description: "Redmi Note 10, 6.0 inches, 250gb, 12gb RAM,4 cameras!",
    price: 12000,
    stock: 43,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTALbNv80PTObO79eSC8OpHi1EaUmZo6BLlkdXkIs66U7iiUv6zdwr_ahjPWapwCf3vO-ywJyM&usqp=CAc",
    image2: "https://i.ytimg.com/vi/oVmsEwj5jmw/maxresdefault.jpg",
    image3:
      "https://elcomercio.pe/resizer/6clXXN-UompBfkORKTFOIsps8qg=/1200x1200/smart/cloudfront-us-east-1.images.arcpublishing.com/elcomercio/7GMALSGASZCYJDJAT6V6E7RTLY.jpg",
    image4:
      "https://cnet4.cbsistatic.com/img/cserj_eQfG2ayAiN_AE1dexh8Zs=/940x0/2019/12/17/37629192-73e0-4bde-9197-dffb0b484b1e/xiaomi-redmi-note-8-7.jpg",
  });
  const producto6 = Product.create({
    name: "Laptop HP i5",
    description: "HP i5 8025u, 15.6 inches, 256gb SSD, 8gb RAM.",
    price: 50000,
    stock: 15,
    image:
      "https://http2.mlstatic.com/D_NQ_NP_945569-MLA31652747525_082019-O.webp",
    image2:
      "https://resources.claroshop.com/medios-plazavip/mkt/5ddfdbb597092_4jpg.jpg",
    image3:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRCCxtReDQzWQJIs5W0KhvLUHHX6UttQnRi8w&usqp=CAU",
    image4:
      "https://www.lacuracao.pe/wcsstore/efe_cat_as/646x1000/curacao/15-DA0010LA_1o.jpg",
  });
  const producto7 = Product.create({
    name: "Laptop HP i3",
    description: "HP i3 8000u, 14 inches, 500 gb HHD, 4gb RAM.",
    price: 30000,
    stock: 15,
    image:
      "https://http2.mlstatic.com/D_NQ_NP_945569-MLA31652747525_082019-O.webp",
    image2:
      "https://solohp.com/media/catalog/product/cache/4/image/9df78eab33525d08d6e5fb8d27136e95/l/a/laptop-hp-15-economica-core-i3-1005g1-4gb-ram-128gb-ssd-solohpcom-01_1.jpg",
    image3:
      "https://www.officedepot.com.gt/medias/36484.jpg-1200ftw?context=bWFzdGVyfHJvb3R8NDcyNDUwfGltYWdlL2pwZWd8aDc4L2g0YS85ODYyOTgxNDg0NTc0LmpwZ3w2ZDU2YjBjNDFmMGMyMTVkNGIyNmE3Mzc0OWVkNmMzYjg3YzgwOTAxZjAwMDc1MzZmMDlkZGVjMjQwYWVmNGVh",
    image4:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQHhArjdWkmMU374BQcZR3eI-8IPxlKT7uNxA&usqp=CAU",
  });
  const producto8 = Product.create({
    name: "Tablet Samsung",
    description: "xPro Max, 10 inches, 4gb RAM, 64gb.",
    price: 25000,
    stock: 8,
    image:
      "https://makkax.com/wp-content/uploads/2020/04/samsung_tab_a_t295_-_plata_1_1_1.jpg",
    image2:
      "https://www.informaticadirecto.com/blog/wp-content/uploads/2019/12/tablet10-01.jpg",
    image3:
      "https://cdn.computerhoy.com/sites/navi.axelspringer.es/public/styles/480/public/media/image/2013/09/20333-samsung-galaxy-tab-3-101-venta-10-octubre.jpg?itok=MNR5061Q",
    image4: "https://i.ytimg.com/vi/nXOEZk880Pk/maxresdefault.jpg",
  });

  const producto9 = Product.create({
    name: "Refrigerator Samsung",
    description: "The refrigerator Smart!",
    price: 95000,
    stock: 8,
    image:
      "https://d26lpennugtm8s.cloudfront.net/stores/959/516/products/51mrs1wzk8l-_sl1000_1-d8bd50c9e4eaf9920815756371652730-1024-1024.jpg",
    image2:
      "https://img.global.news.samsung.com/cl/wp-content/uploads/2019/01/Family-Hub-2019-1.jpg",
    image3:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ2IeKKZegRjPj0j7uhWkj4HsYFuaLVENaTwg&usqp=CAU",
    image4:
      "https://www.paris.cl/dw/image/v2/BCHW_PRD/on/demandware.static/-/Sites-cencosud-master-catalog/default/dwe6038d0d/images/imagenes-productos/701/109609-0000-003.jpg?sw=513&sh=654&sm=fit",
  });
  const producto10 = Product.create({
    name: "Speaker Sony",
    description: "20watts, waterproof speaker.",
    price: 5000,
    stock: 12,
    image:
      "https://www.latercera.com/resizer/d-XvoqbZW0RExKwYCOtrh8lq7hA=/768x0/smart/filters:quality(70):format(webp):no_upscale()/arc-anglerfish-arc2-prod-copesa.s3.amazonaws.com/public/RI5NSJPP2REAVJT7FQZQCJTD4M.jpg",
    image2:
      "https://www.bhphotovideo.com/images/images2000x2000/sony_gtkpg10_gtk_pg10_outdoor_wireless_speaker_1475294.jpg",
    image3:
      "https://images-na.ssl-images-amazon.com/images/I/71qho3p4QoL._AC_SL1500_.jpg",
    image4:
      "https://ecs7.tokopedia.net/img/cache/700/attachment/2018/10/23/154031397410633/154031397410633_8f67db23-37df-46b1-9357-c079ac200be6.png",
  });
  const producto11 = Product.create({
    name: "Speaker JBL",
    description: "10watts, no waterproof.",
    price: 3000,
    stock: 5,
    image:
      "https://d26lpennugtm8s.cloudfront.net/stores/453/714/products/flip55-e371f0ac5a367979dd15811094686878-1024-1024.jpg",
    image2:
      "https://http2.mlstatic.com/D_NQ_NP_762876-MLA43074489600_082020-O.webp",
    image3:
      "https://azcd.harveynorman.com.au/media/catalog/product/j/b/jbl_-_go_2.jpg",
    image4:
      "https://images-na.ssl-images-amazon.com/images/I/71DW6JMyCWL._AC_SY355_.jpg",
  });
  const producto12 = Product.create({
    name: "LG TV ",
    description: "TV 32 inches, FULL HD, HDR",
    price: 6750,
    stock: 5,
    image:
      "https://dj4i04i24axgu.cloudfront.net/guides-ui/statics/0.1.13/images/tipo_tv.png",
    image2:
      "https://intercompras.com/product_thumb_keepratio_2.php?img=images/product/LG_32CS560.jpg&w=650&h=450",
    image3:
      "https://tienda.ecomputer.es/159574-large_default/television-toshiba-32-lcd-32w1863dg-hd.jpg",
    image4:
      "https://www.lg.com/ar/images/televisores/32ld340/gallery/large03.jpg",
  });
  const producto13 = await Product.create({
    name: "LG TV ",
    description: "TV 32 inches, FULL HD, HDR",
    price: 6750,
    stock: 5,
    image:
      "https://dj4i04i24axgu.cloudfront.net/guides-ui/statics/0.1.13/images/tipo_tv.png",
    image2:
      "https://http2.mlstatic.com/D_NQ_NP_890601-MLA20366896793_082015-O.webp",
    image3:
      "https://media.aws.alkosto.com/media/catalog/product/cache/6/image/69ace863370f34bdf190e4e164b6e123/l/c/lcd26.jpg",
    image4:
      "https://www.importechperu.com/wp-content/uploads/2019/03/LG-L194WT-01.png",
  });

  producto1.then((prod) => {
    prod.addCategory(categoria1);
  });

  producto2.then((prod) => {
    prod.addCategory(categoria2);
  });

  producto3.then((prod) => {
    prod.addCategory(categoria4);
  });

  producto4.then((prod) => {
    prod.addCategory(categoria3);
  });
  producto5.then((prod) => {
    prod.addCategory(categoria4);
  });
  producto6.then((prod) => {
    prod.addCategory(categoria1);
  });

  producto7.then((prod) => {
    prod.addCategory(categoria1);
  });

  producto8.then((prod) => {
    prod.addCategory(categoria4);
  });
  producto9.then((prod) => {
    prod.addCategory(categoria3);
  });
  producto10.then((prod) => {
    prod.addCategory(categoria5);
  });
  producto11.then((prod) => {
    prod.addCategory(categoria5);
  });
  producto12.then((prod) => {
    prod.addCategory(categoria2);
  });

  // creating users

  const user1 = User.create({
    firstname: "facu",
    surname: "uriona",
    address: "cordoba",
    password: "1234",
    type: 1,
    username: "facuuriona",
    email: "faqq.uri@gmail.com",
  });

  const user2 = User.create({
    firstname: "cesar",
    surname: "sanchez",
    address: "rosario",
    password: "1234",
    type: 1,
    username: "cesarsanchez",
    email: "cesars.pro@gmail.com",
  });

  const user3 = User.create({
    firstname: "rodrigo",
    surname: "pinea",
    address: "mendoza",
    password: "1234",
    type: 1,
    username: "rodrigopinea",
    email: "rodrigomp88@gmail.com",
  });

  /*    const user4 = User.create({
        firstname: "matias",
        surname: "cordoba",
        address: "las sierras",
        password: "1234",
        type: 1,
        username: "matiascordoba",
        email: "matiascba99@gmail.com"
    });
*/
  const user5 = User.create({
    firstname: "Guillermo",
    surname: "Ambroggio",
    address: "Cordoba",
    password: "guillermo",
    type: 1,
    username: "guillermoambroggio",
    email: "guillermo@gmail.com",
  });

  const user6 = await User.create({
    firstname: "lionel",
    surname: "messi",
    address: "barcelona",
    password: "1234",
    type: 2,
    username: "lionelmessi",
    email: "leomessi@gmail.com",
  });

  //CREAR ORDENES:
  const order1 = Order.create({
    status: "created",
    address: "",
  });

  /*  const order2 = await Order.create({
        status: "created",
        address: "",
    })   */

  //RELACION(1-1) USUARIO-ORDEN:
  //La orden 1 Pertenece al usuario 6
  order1.then((orden) => {
    orden.setUser(user6);
  });

  /*     user5.then(user => {
        user.setOrder(order2)
    }) */

  //RELACION(N-N) PRODUCTOS-ORDENES
  //La orden 1 tiene el producto 12
  order1.then((orden) => {
    orden.addProduct(producto13);
  });

  /*     producto10.then((prod) => {
        prod.addOrder(order2)
    }) */

  ////////// TABLA REVIEWS //////////////

  const user7 = await User.create({
    firstname: "kun",
    surname: "aguero",
    address: "aasd",
    password: "1234",
    type: 2,
    username: "kunaguero",
    email: "kunaguero@gmail.com",
  });

  const reviews1 = await Reviews.create({
    rating: 5,
    visited: 20,
    comments: "Ya compre el producto muchas Gracias!!!",
  });
  const reviews2 = await Reviews.create({
    rating: 3,
    visited: 22,
    comments: "Ya muchas Gracias!!!",
  });

  producto10.then((prod) => {
    prod.addReviews(reviews1);
  });
  producto10.then((prod) => {
    prod.addReviews(reviews2);
  });

  reviews1.setUser(user6);
  reviews2.setUser(user7);

  res.send("LISTO");
});

// Error catching endware.
server.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;
