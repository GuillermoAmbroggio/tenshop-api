const server = require('express').Router();
const { Product, categoriesxproducts, Reviews, User,  Category } = require('../db.js');
const { Op, where } = require("sequelize");




server.get('/', (req, res, next) => {
	Product.findAll().then(function(data){
			res.send(data)
	})
 });

 server.get('/cxp', (req, res, next) => {
	categoriesxproducts.findAll().then(function(data){
			res.send(data)
	})
 });

//Get por id a categoriesxproducts
 server.get('/cxp/:id', (req, res, next) => {
	categoriesxproducts.findByPk(req.params.id).then(post => {
		res.send(post);
	})
 });

 ///elimina cat del producto por id
server.delete('/cxp/:idName/:nameCat', (req, res) => {

	console.log(req.params.idName)
	console.log(req.params.nameCat)


	categoriesxproducts.destroy({
		where: {
			product_id: req.params.idName,
			category: req.params.nameCat
		}
	})
		.then(result => {
			res.sendStatus(200);
		})
		.catch(() => res.status(404))
});

 //////////////////////////////////////////////////


 server.get('/:id', (req, res) => {
	 Product.findByPk(req.params.id).then(post => {
		 res.send(post);
	 })
 });


 server.post('/edit/:id', (req, res) => {
	const {id} = req.params;
	const {body} = req;
	Product.update(body, {where: {id} })
	 .then(result => {
		res.send(result);
	 });
 });


 server.put('/:id', (req, res) => {
	const {id} = req.params;
	const {body} = req;
	Product.update(body, {where: {id} })
	 .then(result => {
		res.send(result);
	 });
 });


server.post("/add", (req, res) => {
	const { category } = req.body;
	addProduct(req.body)
		.then(productCreated => {
			if (category.length === 0) {
				return res.json(productCreated)
			};

			if (category.length === 1) {
				return productCreated.addCategory(category)
			};
			if (category.length > 1) {
				category.forEach((categories) => {
					productCreated.addCategory(categories);
				});
				return res.json(productCreated)
			};
		})
});

function addProduct(product) {
	return Product.create({
		name: product.name,
		description: product.description,
		price: product.price,
		stock: product.stock,
		image: product.image,
		image2: product.image2,
		image3: product.image3,
		image4: product.image4
	})
};


// elimina el producto por id
// si no lo encuentra, devuelve un false
server.delete("/:id", (req, res) => {
	const { id } = req.params;
	Product.destroy({ where: { id } })
		.then(result => {
			res.sendStatus(200);
		})
		.catch(() => res.status(404))
});


server.post("/delete/:id", (req, res) => {
	const { id } = req.params;
	Product.destroy({ where: { id } })
		.then(result => {
			res.sendStatus(200);
		})
		.catch(() => res.status(404))
});

server.put("/:id", (req, res) => {
	const { id } = req.params;
	const { body } = req;
	Product.update(body, { where: { id } })
		.then(result => {
			res.send(result)
		});
});


server.get("/searches/:search", function (req, res) {
	searchProduct(req.params)
		.then((result) => {
			res.send(result);
		});
});

function searchProduct(key) {
	return Product.findAll({
		where: {
			[Op.or]:
			[ { name: { [Op.iLike]: `%${key.search}%` } },
			{ description: { [Op.iLike]: `%${key.search}%` } },
			],
		},
	});
}


server.post("/update", (req, res) => {
	const { id } = req.body;
	const { category } = req.body;
	Product.findOne({ where: { id } })
	.then((productResult) => {
		if (category.length === 0) {
			productResult.update(req.body)
			return res.json(productResult)
		}

		if (category.length === 1) {
			productResult.update(req.body)
			productResult.addCategory(category[0])
		}

		if (category.length > 1) {
			productResult.update(req.body)
			category.forEach((categories) => {
				productResult.addCategory(categories);
			});
			return res.json(productResult)
		}
	})
});

//////////// ADD REVIEWS ///////////
server.post("/:id/review", (req, res) => {
	const { id } = req.params;
	const { username } = req.body;
	const rating  = req.body.review.rating;
	const { comments } = req.body.review;
	//console.log(req.body)
	Reviews.create({
		rating,
		comments,
		productId: id
	})
	.then(r=>{
		User.findOne({ where: { username } })
		.then(u=>{
			r.setUser(u);
			res.send(r); // El resultado del POST!!!
		});

	});

});

server.get("/reviews/allreviews", (req,res) => {
	Reviews.findAll()
	.then((data) => res.send(data))

});

server.post("/review/:idReview", (req, res) => {
	const { idReview } = req.params
	const { comments } = req.body
	const { rating } = req.body
	Reviews.findOne({ where:  {id: idReview }})
        .then(function(resp) {
			if(resp) {

					resp.update({comments})

					resp.update({rating})

			}
			res.send(resp)  ///Resultado del UPDATE
        })

});


server.delete("/review/:idReview", (req, res) => {
	const { id } = req.params;
	const { idReview } = req.params;

	Reviews.destroy({ where:  {id: idReview}})
		.then(result => {
			res.sendStatus(200);
		})
		.catch(() => res.status(404))
});

server.get("/:id/review", (req, res) => {
	const { id } = req.params;

	Reviews.findAll({where: {productId: id }})
	.then((resp)=>{
		console.log(resp);
		res.send(resp)
	})




});





module.exports = server;
