const express = require('express');  //requerimos express
const axios = require('axios'); //requerimos axios para el manejo de rutas
require('dotenv').config({ path: './.env' }); //requiero el archivo .env

const router = express.Router();   

const API_KEY = process.env.API_KEY;
//RUTA GET PARA MOSTRAR IMAGENES DE UNPLASH
router.get('/images', async (req, res) => {
    try {
        // Obtener el término de búsqueda desde la query parameter "q"
        const searchTerm = req.query.q;                 //Esto significa que espera que el cliente proporcione un parámetro de consulta llamado "q"  que contiene el término de búsqueda deseado.
        const width = 800;              
        const height = 600;                     //valores de ancho y altura para las imágenes que se solicitarán a la API de Unsplash.
        // Realizar la solicitud a la API de Unsplash
        const response = await axios(`https://api.unsplash.com/search/photos/?client_id=${API_KEY}&query=${searchTerm}&per_page=21&w=${width}&h=${height}`, {
            headers: {
                Authorization: `${API_KEY}`,
            }
        });

        //Se verifica si la respuesta tiene un estado exitoso. Si el estado de la respuesta es igual a 200, se procesa el cuerpo de la respuesta para extraer 
        //los datos relevantes.Se asume que la propiedad data de response contiene los datos relevantes y se extrae el array de imágenes de la propiedad results.
        if (response.status === 200) {   //El código de estado 200, indica que la solicitud HTTP ha sido exitosa.
            const data = response.data;  
            const images = data.results;
            res.render('images', { images });
        } else {
            throw new Error('Error al obtener las imágenes');  // Esto detiene la ejecución del bloque 
        }
    } catch (error) {
        console.error(error);
        res.send('Error al obtener las imágenes');      //. Dentro de este bloque, se muestra un mensaje de error en la respuesta HTTP
    }
});

module.exports = router;