const express = require('express');
const User = require('../models/user');
const Product = require('../models/products');
const { productsCollection } = require('../config/firebase');
const session = require('express-session');
const router = express.Router();
const methodOverride = require('method-override');

// Configurar method-override para poder eliminar
router.use(methodOverride('_method'));

//DEFINIMOS SESSION PARA QUE LA PROPIEDAD "DESTROY" PARA LUEGO USAR EL OBJETO REQ.SESSION  
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
router.post('/login', async (req, res) => {
    const { mail, password } = req.body;
    //busca al usuario por correo electronico
    try {
        const user = await User.findOne({ mail }); //utilizamos el METODO findOne de mongo para verificar que se encuentre el mail
        //usuario no encontrado
        if (!user) {
            
            return res.render('home', { alertMessage: 'Usuario no encontrado' });
        }

        //comparamos la contraseña proporcionada con la base de datos
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.render('home', { alertMessage: 'Usuario o contraseña incorrectos' });
        }

        //autenticacion exitosa 
        return res.redirect('/products')
    } catch (err) {
        console.error(err)
        return res.render('home', { alertMessage: 'Error en el servidor' });
    }

})

//ELIMINAMOS LA SECCION
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
})

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


router.get('/products/delete/:id', async (req, res) => {
    const productId = req.params.id;
    const productsSnapshot = await productsCollection.doc(productId).get();
    const product = {
        id: productsSnapshot.id,
        ...productsSnapshot.data(),
    }
    res.render('delete-product', { product });
});



//esta ruta DELETE se utiliza para eliminar un producto específico de la base de datos utilizando su ID.
router.delete('/products/delete/:id', async (req, res) => {
    const productId = req.params.id;
    const action = req.body.action;

    try {
        if (action === 'delete') {
            await productsCollection.doc(productId).delete();
            res.redirect('/products');
        } else if (action === 'cancel') {
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