'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
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

//Listar datos de user (funciona pero el metodo async/await no devuelve si se sigo o no a un usuario )
function getUser(req, res){
    var userId = req.params.id;

    User.findById(userId, (err, user)=>{
        if(err){
            return res.status(500).send({message: 'Error en la peticion'});
        }
        if(!user){
            return res.status(404).send({message: 'El usuario no existe'});
        }
        followThisUser(req.user.sub, userId).then((value)=>{
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });    
    });
}
async function followThisUser(identity_user_id, user_id){
    var following = await Follow.findOne({user: identity_user_id, followed: user_id}).exec((err, follow)=>{
        if(err) return handleError(err);
        return follow;
    });    

    var followed = await Follow.findOne({user: user_id, followed: identity_user_id}).exec((err, follow)=>{
        if(err) return handleError(err);
        return follow;
    }); 
    
    return {
        following: following,
        followed: followed
    }
}

//Devolver un listado de usuarios paginados (no funciona, problema con metodo async/await)
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
            return res.status(404).send({message: 'No existen usuarios'});
        }
        else{
            followUserIds(identity_user_id).then((value)=>{
                return res.status(200).send({
                    users,
                    users_following: value.following,
                    users_follow_me: value.followed, 
                    total, 
                    pages: Math.ceil(total/itemsPerPage)});
            });
            
        }
    });
}
async function followUserIds(user_id){
    var following = await Follow.find({"user": user_id}).select({'_id':0, '__v':0, 'user': 0}).exec((err, follows)=>{
        //if(err) return handleError(err);
        return follows;
        //console.log(following);
    });

    var followed = await Follow.find({"followed": user_id}).select({'_id':0, '__v':0, 'followed': 0}).exec((err, follows)=>{
        //if(err) return handleError(err);
        return follows;
        //console.log(followed);
    });

    //Procesar following ids
    var following_clean = [];

    following.forEach((follow)=>{
        following_clean.push(follow.followed);
    });
     
    //Procesar followed ids
    var followed_clean = [];
    
    followed.forEach((follow)=>{
        followed_clean.push(follow.user);
    });

    return {
        following: following_clean,
        followed: followed_clean
    }
}

//Devolver cantidad de usuarios que me siguen y que sigo (async/await no funciona)
function getCounters(req, res){
    var userId = req.user.sub;
    if(req.params.id){
        userId = req.params.id;
    }

    getCountFolow(userId).then((value) =>{
        return res.status(200).send(value);
    });
    
}
async function getCountFolow(user_id){
    var following = await Follow.count({"user": user_id}).exec((err, count)=>{
        if(err) return handleError(err);
        else return count;
    });

    var followed = await Follow.count({"followed": user_id}).exec((err, count)=>{
        if(err) return handleError(err);
        else return count;
    });

    var publications = await Publication.count({"user": user_id}).exec((err, count)=>{
        if(err) return handleError(err);
        return count;
    });

    return {
        following: following,
        followed: followed,
        publications: Publication
    }
}

//Editar datos de usuario
function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    //borrar password 
    delete update.password;

    if(userId != req.user.sub){//si user que recibo por url es igual al objeto que tiene el token de identificado actual
        res.status(500).send({message: 'No tienes permiso para actualizar los datos'})
    }
    else{
        User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated)=>{
            if(err){
                res.status(500).send({message: 'Error en la peticion'})
            }
            else if(!userUpdated){
                res.status(404).send({message: 'No existe usuario actualizado'});
            }
            else{
                res.status(200).send({user: userUpdated});
            }
        })         
    }
}

//Subir archivos de imagen y avatar de usuario
function uploadImage(req, res){
    var userId = req.params.id;

    
    if(req.files){//si esta enviando un fichero
        var file_path = req.files.image.path;//recojemos el path de la imagen que se manda por post
        var file_split = file_path.split('\\');//separa el path en un array que tiene [uploads, users, nombre de archivo]
        var file_name = file_split[2];//nombre de archivo esta en la pos 2 del array

        var ext_split = file_name.split('\.');//separa el nombre del [archivo, extension] en otro array
        var file_ext = ext_split[1];//saca la extension 

        if(userId != req.user.sub){//solo usuario logueado puede actualizar su imagen
            return removeFilesOfUploads(res, file_path, 'No tienes permisos para actualizar la imagen');
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            //actulizar documento de usuario logueado
            User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) => {
                if(err){
                    return res.status(500).send({message: 'Error en la peticion'});
                }
                else if(!userUpdated){
                    return res.status(404).send({message: 'No se ha podido actualizar'})
                }
                else{
                    return res.status(200).send({user: userUpdated});
                }
            });

        }else{
            return removeFilesOfUploads(res, file_path, 'Extension no valida');
        }

    }else{
        return res.status(200).send({message: 'No se han subido imagenes'});
    }
}

function removeFilesOfUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {//elimina el archivo que subimos
        return res.status(200).send({message: message}); 
    });
}

//Obtener imagen de un usuario 
function getImageFile(req, res){
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/'+image_file;

    fs.exists(path_file, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }
        else{
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
}