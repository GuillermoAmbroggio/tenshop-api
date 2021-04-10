const server = require('express').Router();
const { categoriesxproducts, Product, Category } = require('../db.js');

server.get("/:category", (req, res) => {
    Category.findByPk(req.params.category).then(category => {
      if(category){
        category.getProducts({ attributes: [ "name", "description", "price", "stock", "image", "id"] })
        .then(products => {
            res.send(products)
        })
      }else{
        res.sendStatus(404)
      }
        
    })
});


// MUESTRA TODAS LAS CATEGORIAS
server.get("/",  (req, res, next) => {
  Category.findAll().then(function(categorias){
        res.send(categorias);
    });
  });


// MODIFICA ALGUNA CATEGORIA SEGUN ID
/* server.put('/:id', (req, res) => {
  const {id} = req.params;
  const {body} = req;
  Category.update(body, {where: {id} })
    .then(result => {
      res.send(result);
    })
}) */




// este post devuelve un array con dos componentes,
// el objeto con la categoria recien publicada en la DB
// y devuelve un booleano con true (si se agrego en la DB)
// o devuelve un booleano con false (si no se agregó en la tabla)
server.post("/add", (req, res) => {
	const { name, description} = req.body
  Category.findAll({ where: { name: name, description: description }})
    .then(result =>{
      if(result.length !== 0){
        res.status(404).send(false)
      }else{ 
        Category.create({
          name: name,
          description: description
        })
        //sino esta, la crea y la envia como resultado para agregar al store
        .then(
          res.status(200).send(true)
        );
      }
    })
});

// server.delete("/delete", (req, res) => {
//   const { name} = req.body
// 	Category.destroy({ where: { name: name } })
// 		.then(result => {    
//       console.log(result)
//       if(result === 1){  
//         res.sendStatus(200);
//       }else{
//         res.status(404).send("No existe la categoria")
//       }
//       })
//       .catch(() => res.status(404))
//   });
  server.delete("/:name", (req, res) => {
    const { name } = req.params;
    Category.destroy({ where: { name } })
      .then(result => {
        res.status(200).send(true);
      })
      .catch(() => res.status(404).send(false))
  });

  //para modificar una categoria(update )
  server.put("/modify/:name", (req, res) => {
	const { name } = req.params;
	const  { body }  = req;
	Category.update(body, { where: { name } })
		.then(result => {
			res.status(200).send(body,name)
    })
    .catch(()=> res.status(404));
 });

module.exports = server;
