const mongoose = require('mongoose');
const { userType } = require('../utils/helper/Enum'); 
const { USER , SELLER } = userType;
const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    },
    addressDetails: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: [USER , SELLER],
        default: USER
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: locationSchema, 
        required: true
    },
    products: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product',                
        default: []
    },
    cart: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product',
        default: []
    }
});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
module.exports = User;
