'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var jwt = require('../services/jwt');
//Pruebas
function home (req, res){
    res.status(200).send({message: 'Accion user works!'});
}

function pruebas (req, res){
    res.status(200).send({message: 'Accion pruebas its works!'});
}
//Registro
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
//Login 
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

                    if(params.gettoken){
                        //generar y devolver un token
                        return res.status(200).send({token: jwt.createToken(user)}) 
                    }else{
                        //devolver datos de usuario
                    }
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

//Listar datos de user
function getUser(req, res){
    var userId = req.params.id;

    User.findById(userId, (err, user)=>{
        if(err){
            return res.status(500).send({message: 'Error en la peticion'});
        }
        else if(!user){
            res.status(404).send({message: 'El usuario no existe'});
        }
        else{
            res.status(200).send({user});
        }
    });
}

//Devolver un listado de usuarios paginados
function getUsers(req, res){
    var identity_user_id = req.user.sub;//id del user logueado

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total)=>{
        if(err){
            return res.status(500).send({message: 'Error en la peticion'});
        }
        else if(!users){
            res.status(404).send({message: 'No existen usuarios'});
        }
        else{
            res.status(200).send({users, total, pages: Math.ceil(total/itemsPerPage)});
        }
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers
}