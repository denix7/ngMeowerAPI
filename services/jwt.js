'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_red_social'

exports.createToken = function(user){
    var payload = {//datos del user que se quiere codificar en el token
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix //fecha de expiracion
    };

    return jwt.encode(payload, secret)
};