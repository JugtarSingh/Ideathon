const express = require('express');
const cors = require('cors');
const path = require('path');
const { serverConfig, connectToMongoDB, connectToCloudinary } = require('./config')
const app = express();
const apiRoutes = require('./routes');
const homeRoutes = require('./routes/home-routes');
const { attachUserFromToken } = require('./middleware/auth-middleware');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to attach user from token if available
app.use(attachUserFromToken);

// Home routes (landing page, bestsellers, categories)
app.use('/', homeRoutes);

app.use('/api', apiRoutes);

// Product detail page route (accessible from home routes)
app.get('/product/:id', (req, res, next) => {
    const ProductController = require('./controller/product-controller');
    const { attachUserFromToken } = require('./middleware/auth-middleware');
    attachUserFromToken(req, res, () => {
        ProductController.getProductDetailPage(req, res);
    });
});

connectToMongoDB();
connectToCloudinary();

app.listen(serverConfig.PORT , ()=>{
    console.log(`Successfully started the server on PORT:  ${serverConfig.PORT}`)
})