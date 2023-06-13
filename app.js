const express = require('express');
const hbs = require('hbs');
const rutasRoutes = require('./router/rutas')
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const apiRouter = require('./router/api');


const app = express();



// Configurar el middleware method-override
app.use(methodOverride('_method'));




//llamamos a las variables de entorno PORT 
require('dotenv').config({ path: './.env' });
const port = process.env.PORT || 3010

app.use(bodyParser.urlencoded({ extended: true }));
//configuramos el motor de plantilla
app.set('view engine', 'hbs')
//CONFIGURAMOS EL MIDDELWARE PARA PROCESAR LAS SOLICITUDES
app.use(express.urlencoded({ extended: true }));
//CONFIGURAMOS LOS PARTIALS NAVBAR HEADER Y FOOTER
hbs.registerPartials(__dirname + '/views/partials');
app.use(express.static('public'));

//requerimos las rutas 
app.use('/', rutasRoutes)  
app.use('/api', apiRouter)






;
app.listen(port, () => {
    console.log(`server is listeng or port http://localhost:${port}`)
})