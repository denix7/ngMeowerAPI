'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');

function home (req, res){
    res.status(200).send({message: 'Accion user works!'});
}

function pruebas (req, res){
    res.status(200).send({message: 'Accion pruebas its works!'});
}

function saveUser(req, res){
    var user = new User();
    var params = req.body;

    if(params.name && params.surname && params.nick && params.email && params.password)
    {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        //Controla usuarios dupolicados
        User.find({ $or: [
                                {email: user.email.toLowerCase()}, 
                                {nick: user.nick.toLowerCase()}
        ]}).exec((err, users)=>{

            if(err){
                return res.status(500).send({message: 'Error en la peticion de usuario'}) 
            }    
            if(users && users.length >=1){
                return res.status(200).send({message: 'El usuario que intenta registrar ya existe'});
            }
            else{
                //Cifra contraseña y guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash)=>{
                user.password = hash;

                    user.save((err, userStored)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al registrar el usuario'});
                    }
                    else if(!userStored){
                        res.status(404).send({message: 'No se ha registrado el usuario'});
                    }else{
                        res.status(200).send({user: userStored});
                    }
                    });
                });
            }
        });

    }else{
        res.status(200).send({message: 'Es necesario enviar todos los campos necesarios'});
    }
}

function loginUser(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user)=>{
        if(err){
            return res.status(500).send({message: 'Error en la peticion'});
        }
        else if(user){
            bcrypt.compare(password, user.password, (err, check)=>{
                if(check){
                    //devolver datos de usuario
                    user.password = undefined;
                    return res.status(200).send({user})
                }
                else{
                    return res.status(404).send({message: 'El usuario no se ha podido identificar'});
                }
            });
        }
        else{
            res.status(404).send({message: 'El usuario no existe'});
        }
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser
}