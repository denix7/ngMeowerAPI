'use strict'

var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

//Pruebas
function prueba (req, res){
    res.status(200).send({message: 'Accion follow works!'});
}

//Seguir usuario
function saveFollow(req, res){
    var params = req.body;
    var follow = new Follow();
    
    follow.user = req.user.sub;//id del usuario identificado
    follow.followed = params.followed;//le paso por parametro el valor followed, id al que quiero seguir

    follow.save((err, followStored)=>{
        if(err)
            return res.status(500).send({message: 'Error al guardar el seguimiento'});
        else if(!followStored)
            return res.status(404).send({message: 'El seguimiento no se ha guardado'});
        else    
            return res.status(200).send({follow: followStored});        
    })
}

//Dejar de Seguir a usuario
function deleteFollow(req, res){
    var userId = req.user.sub;//mandamos usuario logueado
    var followId = req.params.id;//mandamos usuario al que dejaremos de seguir por URL

    Follow.find({'user': userId, 'followed': followId}).remove(err => {
        if(err)
            return res.status(500).send({message: 'Error al dejar de seguir'});
        else    
            return res.status(200).send({message: 'El follow se ha eliminado'});    
    })
}

//Listar usuarios que sigo
function getFollowingUsers(req, res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;//la pagina me llegara por url y por el campo id
    }

    var itemsPerPage = 4;

    Follow.find({user: userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total)=>{
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        if(!follows)
            return res.status(404).send({message: 'No sigues a ningun usuario'});
    
        return res.status(200).send({total: total, pages: Math.ceil(total/itemsPerPage), follows})
    })
}

//Listar usuarios que me siguen
function getFollowedUsers(req, res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPerPage = 4;

    Follow.find({followed: userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        if(!follows)
            return res.status(404).send({message: 'No tienes seguidores'});
            
        return res.status(200).send({total: total, pages: Math.ceil(total/itemsPerPage), follows});    
    })
}

module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers
}