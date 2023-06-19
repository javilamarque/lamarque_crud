const express = require('express');
const User = require('../models/user');                         //requerimos y hacemos uso de archivo user fde la carpeta model para poder almacenar los datos en mongo
const Product = require('../models/products');                  //llamamos al modelo product de model
const { productsCollection } = require('../config/firebase'); //llamamos a productsCollection de la carpeta config archivo firebase.js
const session = require('express-session');                   //requerimos session para los inicio de sesion
const router = express.Router();                                //requerimos router de express
const methodOverride = require('method-override');             //metodo overredi para utilizar el metodo delete

// Configurar method-override para poder eliminar
router.use(methodOverride('_method'));

//DEFINIMOS SESSION  
router.use(session({
    secret: '123456', // una clave secreta para firmar la sesión
    resave: false,
    saveUninitialized: false
}));

//-----------------------------------------------------------PAGINA  DE INICIO PARA LOGEARSE O REGISTRARSE PARA PODER VER, EDITAR ELIMINAR O CREAR PRODUCTOS DE FIRESTORE-------------------
router.get('/', async (req, res) => {
    res.render('home', {title: 'bienvenido, debes registarte o logearte para ver los productos'})
})
//pagina de inicio debe logearse para ver los productos
router.post('/login', async (req, res) => {          //ruta POST para manejar la solicitud.
    const { mail, password } = req.body;            // Extrae las propiedades 'mail' y 'password' del cuerpo (body) de la solicitud HTTP
    //busca al usuario por correo electronico       //y las asigna a las variables 'mail' y 'password' respectivamente. 
    try {
        const user = await User.findOne({ mail });          //utilizamos el METODO findOne de mongo para verificar que se encuentre el mail de la variable 'mail'
        //usuario no encontrado
        if (!user) {                                        //Comprueba si la variable 'user' es falsa o nula
            
            return res.render('home', { alertMessage: 'Usuario no encontrado' }); //si no se encuentra, renderiza a home para llamar al script del home
        }

        //comparamos la contraseña proporcionada con la base de datos
        const isPasswordValid = await user.comparePassword(password);           //Llama al método 'comparePassword' en el objeto 'user'
                                                                                //para verificar si la contraseña proporcionada coincide con la contraseña almacenada en la base de datos
        if (!isPasswordValid) {                                      //Comprueba si la variable 'isPasswordValid' es falsa o nula, lo que significa que la contraseña proporcionada no es válida.
            return res.render('home', { alertMessage: 'Contraseña incorrecta' }); //script de home
        }

        //autenticacion exitosa 
        return res.redirect('/products')
    } catch (err) {
        console.error(err)
        return res.render('home', { alertMessage: 'Error en el servidor' });    //script de home
    }

})

//------------------------------------------------------------------ELIMINAMOS LA SECCION----------------------------------------------------------------------
router.get('/logout', (req, res) => {
    req.session.destroy();                              //Llama al método 'destroy()' en el objeto 'session' de la solicitud (req) para destruir la sesión del usuario
    res.redirect('/')
})

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

//----------------------------------------------------------------REGISTER DE USUARIOS --------------------------------------------------------------------------
router.get('/register', (req, res) => {
    res.render('register', {message: 'Gracias por registrate!!'})
})

router.post('/register', async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            password: req.body.password,
            mail: req.body.mail
        });

        await user.save();
        res.redirect('/'); // Redirige al usuario a la página de inicio de sesión
    } catch (err) {
        console.log(err);
    }
});



    
//-----------------------------------------------------------------------METODO POST PARA CREAR PRODUCTO Y GET PARA VER LOS PRODUCTOS CREADO--------------------------------------------
router.get('/products/create', (req, res) => {
    res.render('crear')
})

router.post('/products/create', async (req, res) => {
    const { marca, name, price, supplier } = req.body;
    const product = {
        marca,
        name,
        price,
        supplier
    };
    await productsCollection.add(product)
    res.redirect('/products')
}) 

//-----------------------------------------------------------------------------------MOSTRAR Y EDITAR LOS PRODUCTOS-----------------------------------------------------------------------------
//esta ruta GET se utiliza para obtener los datos de un producto específico desde la base de datos utilizando su ID y mostrarlos en un formulario de edición
router.get('/products/edit/:id', async (req, res) => {
    const productId = req.params.id;
    const productsSnapshot = await productsCollection.doc(productId).get();
    const product = {
        id: productsSnapshot.id,
        ...productsSnapshot.data()
    }
    
    res.render('edit', {product})
})



router.post('/products/edit/:id', async (req, res) => {
    const productId = req.params.id;
    const { marca, name, price, supplier } = req.body;

    const product = {
        marca,
        name,
        price,
        supplier,
    }
    await productsCollection.doc(productId).update(product);
    res.redirect('/products')
})


// ---------------------------------------------------METODO GET PARA OBTENER LOS PRODUCTOS ALMACENADOS EN FIREBASE UNA VES QUE EL USUARIO SE AUTENTICO----------------------------------
router.get('/products', async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.render('products', { products })
    } catch (err) {
        console.error(err)
        res.send('error al conectar')
    }
})

//--------------------------------------------------------------------------------ELIMINAR PRODUCTO-----------------------------------------------------------------------------------


router.get('/products/delete/:id', async (req, res) => {        //definimos la ruta get donde id es un parametro dinamico 
    const productId = req.params.id;
    const productsSnapshot = await productsCollection.doc(productId).get();
    const product = {
        id: productsSnapshot.id,
        ...productsSnapshot.data(),                     //operador de propagacion para copiar los datos del objeto a product
    }
    res.render('delete-product', { product });
});



//esta ruta DELETE se utiliza para eliminar un producto específico de la base de datos utilizando su ID.
router.delete('/products/delete/:id', async (req, res) => {
    const productId = req.params.id;                      //recupera el ID del producto
    const action = req.body.action;                        //verifica el valor de la variable 'action'

    try {
        if (action === 'delete') {                          // si es igual se elimina el documento correspondiente al ID 
            await productsCollection.doc(productId).delete();
            res.redirect('/products');
        } else if (action === 'cancel') {                   //si cnacela se redirecciona a products
            res.redirect('/products');
        } else {
            res.send('Acción inválida');                
        }
    } catch (error) {
        console.error(error);
        res.send('Error al eliminar el producto');
    }
});

module.exports = router;