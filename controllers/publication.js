'use strict'

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res){
    res.status(200).send({message: 'Accion publication works!'});
}

//Crear nueva publicacion
function savePublication(req, res){
    var params = req.body;

    if(!params.text)
        return res.status(200).send({message: 'Debes enviar un texto'});

    var publication = new Publication();    
    publication.user = req.user.sub;
    publication.text = params.text;
    publication.file = null;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored)=>{
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else if(!publicationStored)
            return res.status(404).send({message: 'No se ha creado la publicacion'});
        else{    
            return res.status(200).send({publication: publicationStored});          
        }    
    });
}

//devolver publicaciones de usuarios que sigo de forma paginada
function getPublications(req, res){
    var page = 1;
    if(req.params.page)
        page = req.params.page;

    var itemsPerPage = 4;
    
    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows)=>{
        if(err)
            res.status(500).send({message: 'Error en la peticion'});
        
        var follows_clean = [];
        
        follows.forEach((follow)=>{
            follows_clean.push(follow.followed);
        });

        Publication.find({user: {"$in": follows_clean}}).sort('created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total)=>{
            if(err) 
                return res.status(500).send({message: 'Error al devolver publicaciones'});
            else if(!publications)
                return res.status(500).send({message: 'No hay publicaciones'});
            else{
                return res.status(200).send({
                    total_items: total,
                    pages: Math.ceil(total/itemsPerPage),
                    page: page,
                    publications
                })
            }
        });
    });
}

//Devolver una publicacion por su id
function getPublication(req, res){
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication)=>{
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else if(!publication)
            return res.status(404).send({message: 'No hay publicaciones'});
        else
            return res.status(200).send({publication});  
    });
}

//Eliminar publicacion por su ID
function deletePublication(req, res){
    var publicationId = req.params.id;

    Publication.find({'user': req.user.sub, '_id': publicationId}).remove((err)=>{
        if(err)
            return res.status(500).send({message: 'Error en la eliminacion de la publicacion'});
        else    
            return res.status(200).send({message: 'Publicacion eliminada'});
    });
        
}

module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication
}