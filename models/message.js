const mongoose = require('mongoose');  //requerimos mongoose

const messagesSchema = new mongoose.Schema({   //definimos el esquema
    nombre: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messagesSchema);   //utilizamos mongoose.model() para crear un modelo de Mongoose llamado Message

module.exports = Message;   //lo exportamos