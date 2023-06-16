const mongoose = require('mongoose');
// instale un modulo para encriptar la contraseña llamada BCRYPT
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/users');;

// define un esquema de usuario utilizando Mongoose 
const userSchema = new mongoose.Schema({ //Esta línea crea una nueva instancia de un esquema de Mongoose llamado userSchema 
    //Aquí se define la propiedad name del esquema del usuario.
    name: {
        type: String,

    },
    mail: {
        type: String,

    },
    password: {
        type: String,

    }

});
//Este bloque de código define un middleware en Mongoose que se ejecutará antes de que se guarde un documento de usuario en la base de datos. El middleware utiliza la función
//pre del esquema de usuario y se activa antes del evento save

userSchema.pre('save', function (next) {         //Esta línea registra el middleware en el esquema de usuario y especifica que se debe ejecutar antes del evento save
    bcrypt.hash(this.password, 10, (err, hash) => { // esta funcion llama a un callback en donde le vamos a asignar el password al hash generado
        if (err) {
            return next(err);
        }
        this.password = hash;
        next();
    })
})

//metodo para comparar contraseñas y mail en mongo

userSchema.methods.comparePassword = function (candidatePassword) {  //Esta línea define un método llamado comparePassword, El método acepta un parámetro candidatePassword,     
                                                                    //que es la contraseña que se quiere comparar con la contraseña almacenada en el documento de usuario.
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
            if (err) {
                return reject(err)
            }
            resolve(isMatch)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = User;