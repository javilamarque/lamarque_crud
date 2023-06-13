const { db, productsCollection } = require('../config/firebase')

//este archivo define una clase "Product" que representa un producto y proporciona un método estático "getAllProducts" para obtener todos los productos de la base de datos.

class Product {
    constructor(data) {
        this.id = data.id;
        this.marca = data.marca;
        this.name = data.name;
        this.price = data.price;
        this.supplier = data.supplier;
    }

    static async getAllProducts() {
        const productsSnapshot = await db.collection('products').get();
        const products = productsSnapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));
        return products;
    }
}

module.exports = Product;
