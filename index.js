const express = require('express');
const cors = require('cors');
const path = require('path');
const { serverConfig, connectToMongoDB, connectToCloudinary } = require('./config')
const app = express();
const apiRoutes = require('./routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

connectToMongoDB();
connectToCloudinary();
app.get('/',(req,res)=>{
    res.send("home");
})
app.listen(serverConfig.PORT , ()=>{
    console.log(`Successfully started the server on PORT:  ${serverConfig.PORT}`)
})