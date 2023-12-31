const { db } = require('../config/firebase')

//este archivo define una clase "Product" que representa un producto y proporciona un método estático "getAllProducts" para obtener todos los productos de la base de datos.

class Product {
    constructor(data) {
        this.id = data.id;
        this.marca = data.marca;
        this.name = data.name;
        this.price = data.price;
        this.supplier = data.supplier;
    }

        //funcion asincrona para optener todos los productos
    static async getAllProducts() {
        const productsSnapshot = await db.collection('products').get();            //db es una instancia a la base de datos la utilizo para almacenar en productSnapshot
        const products = productsSnapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() })); //utilizamos el metodo map para iterar cada producto
        return products;   //nos devuelve el array de products
    }
}

module.exports = Product;     //exportamos luego llamarlo desde rutas.js
