const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL;

const connectToMongoDB = async () =>{
    mongoose.connect(`${MONGODB_URL}/e-commerce-db`)
  .then(() => console.log('Connected!'));
}

module.exports = connectToMongoDB;
