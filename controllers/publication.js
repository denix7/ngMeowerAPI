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

//Subir fichero a publicaciones
function uploadImage(req, res){
    var publicationId = req.params.id;

    
    if(req.files){//si esta enviando un fichero
        var file_path = req.files.image.path;//recojemos el path de la imagen que se manda por post
        var file_split = file_path.split('\\');//separa el path en un array que tiene [uploads, users, nombre de archivo]
        var file_name = file_split[2];//nombre de archivo esta en la pos 2 del array
        var ext_split = file_name.split('\.');//separa el nombre del [archivo, extension] en otro array
        var file_ext = ext_split[1];//saca la extension 

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            
            Publication.findOne({'user': req.user.sub, '_id':publicationId}).exec((err, publication)=>{
                console.log(publication)
                if(publication){
                    //actulizar documento de publicacion
                    Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new:true}, (err, publicationUpdated) => {
                        if(err){
                            return res.status(500).send({message: 'Error en la peticion'});
                        }
                        else if(!publicationUpdated){
                            return res.status(404).send({message: 'No se ha podido actualizar'})
                        }
                        else
                            return res.status(200).send({publication: publicationUpdated});
                    });
                }else{
                    return removeFilesOfUploads(res, file_path, 'No tienes permisos para actualizar esta publicacion');
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
    var path_file = './uploads/publications/'+image_file;

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
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}