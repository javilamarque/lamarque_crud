const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Message = require('../models/message');

//variables de entrono
USER_MAILTRAP = process.env.USER_MAILTRAP;
PASS_MAILTRAP = process.env.PASS_MAILTRAP;


// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: USER_MAILTRAP, 
        pass: PASS_MAILTRAP,
    }
});

// Ruta para mostrar el formulario de envío de correo
router.get('/enviar', (req, res) => {
    res.render('enviar'); // Renderiza la plantilla mail.hbs
});



// Ruta para enviar el correo electrónico
router.post('/enviar', (req, res) => {
    const { nombre, correo, mensaje } = req.body;

    // Crea un nuevo objeto de mensaje
    const newMessage = new Message({
        nombre,
        correo,
        mensaje
    });

    // Guarda el mensaje en la base de datos
    newMessage.save()
        .then(message => {
            // configuramos el trasporter de nodemailer
            transporter.sendMail({
                from: 'mi_backend@student.com', 
                to: correo,
                subject: '¡Gracias por tu mensaje!',
                text: `Hola ${nombre},\n\nGracias por tu mensaje. Hemos recibido lo siguiente:\n\n${mensaje}\n\nSaludos,\nDesde mi  Primer Aplicacion`
            }, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email enviado: ' + info.response);
                }
            });

            res.redirect('/'); // Redirigimos al home despues de emnviar el mal
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(500);   //Error interno del servidor
        });
});

module.exports = router;