const CrudRepository = require("./crud-repository");
const { Product } = require("../models");
class ProductRepository extends CrudRepository{
    constructor(){
        super(Product);
    }
    async  getProduct(filters){
        const customFilters = {}
        if(filters?.category){
            customFilters.category = filters.category;
        }
        if(filters?.price){
            const [minPrice , maxPrice] = filters.price.split('-');
            customFilters.price = { $gte:minPrice , $lte:maxPrice};
        }
        const products = await Product.find(customFilters);
        return products;
    }
}

module.exports = ProductRepository;