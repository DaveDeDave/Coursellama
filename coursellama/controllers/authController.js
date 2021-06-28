'use strict';

const jwt = require('jsonwebtoken');
const fs = require('fs');
const { promisify } = require('util');
const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);
const readFile = promisify(fs.readFile);

module.exports = {
    async generateJWT(user) {
        const payload = {
            username: user.username,
            role: user.role
        };
        const private_key = await readFile(`${__dirname}/keys/jwtRS256.key`).catch( (e) => { throw new Error(e); } );
        const options = {
            algorithm: 'RS256',
            expiresIn: '7d'
        };
        const token = await sign(payload, private_key, options).catch((e) => {throw new Error(e);});
        
        return token;
    },
    async verifyJWT(token) {
        const public_key = await readFile(`${__dirname}/keys/jwtRS256.key.pub`).catch( (e) => { throw new Error(e); } );
        const result = await verify(token, public_key);

        return result;
    }
};
