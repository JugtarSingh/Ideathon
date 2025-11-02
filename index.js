const express = require('express');
const cors = require('cors');
const { serverConfig, connectToMongoDB, connectToCloudinary } = require('./config')
const app = express();
const apiRoutes = require('./routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

connectToMongoDB();
connectToCloudinary();
app.get('/',(req,res)=>{
    res.send("home");
})
app.listen(serverConfig.PORT , ()=>{
    console.log(`Successfully started the server on PORT:  ${serverConfig.PORT}`)
})