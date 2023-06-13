const admin = require('firebase-admin');

//configuramos las credenciales de firebase
const serviceAccount = require('../crud-lamarque-firebase-adminsdk-p8ck1-d6a38e3997.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

//optenemos una instancia de firebase
const db = admin.firestore();
const productsCollection = db.collection('products');

module.exports = { db, productsCollection };