const path = require('path');

if(!process.env.ILP_DIR){
    throw Error("ILP_DIR env variable is not set!")
}
const dotenv = require('dotenv').config({ path: path.resolve(process.env.ILP_DIR, '.env'), silent:true });

if (dotenv.error) {
    throw Error(dotenv.error);
}
