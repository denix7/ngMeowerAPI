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
    }else{
        res.status(200).send({message: 'Es necesario enviar todos los campos necesarios'});
    }
}

module.exports = {
    home,
    pruebas,
    saveUser
}