const CrudRepository = require("./crud-repository");
const { Product } = require("../models");
class ProductRepository extends CrudRepository{
    constructor(){
        super(Product);
    }
    async  getProduct(filters){
        try {
            // Check if mongoose is connected
            if (Product.db.readyState !== 1) {
                console.log('Database not connected, returning empty array');
                return [];
            }
            
            const customFilters = {}
            if(filters?.category){
                customFilters.category = filters.category;
            }
            if(filters?.price){
                const [minPrice , maxPrice] = filters.price.split('-');
                customFilters.price = { $gte:minPrice , $lte:maxPrice};
            }
            const products = await Product.find(customFilters);
            return products || [];
        } catch (error) {
            console.error('Error in getProduct:', error.message);
            // Return empty array instead of throwing to prevent hanging
            return [];
        }
    }
}

module.exports = ProductRepository;