const server = require('express').Router();
const { User, Order , Productsxorders , Product } = require('../db.js');

server.get('/status/:status', (req, res, next) => {
	const {status} = req.params;
	console.log(status);
	if(status === "allorders"){
		console.log("PRIMER IFFFFFF")
		Order.findAll({ include: User }).then(function(data){
		res.send(data)
		})
	}else{
		Order.findAll({where: {status: status}, include: User }).then(function(result){
			console.log("ENTRO ACA", status)
		res.send(result)
	});
	}
 });

 server.get('/id/:idOrder', (req, res, next) => {
	const {idOrder} = req.params;
	Order.findAll({where: {id: idOrder}}).then(function(data){
		res.send(data)
	})
	.catch(err => {res.status(404).send("ERROR")})
 });

 //GET A LAS ORDENES QUE TENGAN ESE PRODUCTO
  server.get('/ORDD/:idProd', (req, res)=> {
		const {idProd} = req.params
		console.log(idProd)
		Productsxorders.findAll({where: {product_id: idProd}})
		.then((data) => {
			res.send(data)
		})

	})

	//GET A LAS ORDENES QUE TENGAN ESE PRODUCTO
server.get('/products/:idOrder', (req, res)=> {
	const {idOrder} = req.params
	//console.log(idProd)
	Order.findOne({where: {id: idOrder}, include: Product })
	.then((data) => {
		res.send(data)
	})

})

server.delete("/orderdelete/:orderId/:productId", (req, res) => {
	const { orderId, productId } = req.params;
	Productsxorders.destroy({
		where: {
			order_id: orderId, product_id: productId
		}
	})
		.then((result) => {
			return res.sendStatus(200)
		})
		.catch(err => res.send(err))
});
module.exports = server;
