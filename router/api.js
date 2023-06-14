const express = require('express');
const axios = require('axios');
require('dotenv').config({ path: './.env' }); //requiero el archivo .env

const router = express.Router();

const API_KEY = process.env.API_KEY;
//RUTA GET PARA MOSTRAR IMAGENES DE UNPLASH
router.get('/images', async (req, res) => {
    try {
        // Obtener el término de búsqueda desde la query parameter "q"
        const searchTerm = req.query.q;
        const width = 800;
        const height = 600;
        // Realizar la solicitud a la API de Unsplash
        const response = await axios(`https://api.unsplash.com/search/photos/?client_id=${API_KEY}&query=${searchTerm}&per_page=21&w=${width}&h=${height}`, {
            headers: {
                Authorization: `${API_KEY}`,
            }
        });

        // Verificar si la respuesta es exitosa
        if (response.status === 200) {
            const data = response.data;
            const images = data.results;
            res.render('images', { images });
        } else {
            throw new Error('Error al obtener las imágenes');
        }
    } catch (error) {
        console.error(error);
        res.send('Error al obtener las imágenes');
    }
});

module.exports = router;