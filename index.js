'use strict'

var mongoose = require('mongoose');

var port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/ngRedSocial', (err, res)=>{
    if(err){
        throw err;
    }else{
        console.log('La conexion a la BD fue exitosa');
    }
})