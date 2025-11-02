const mongoose = require('mongoose');
const { productCategory } = require('../utils/helper/Enum');
const { GAMES ,GROCERY , BEAUTY , SPORTS , BOOKS , TOYS , FURNITURE , ELECTRONICS , CLOTHES } = productCategory;

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    image: { 
        type: Array, 
        required: true 
    },
    category: {  // clothes, electronics, furniture, 
        type: String, 
        enum: [GAMES ,GROCERY , BEAUTY , SPORTS , BOOKS , TOYS , FURNITURE , ELECTRONICS , CLOTHES],
        required: true 
    },
    bestseller: { 
        type: Boolean, 
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Product = mongoose.models.Product || mongoose.model('Product',productSchema);

module.exports = Product;

