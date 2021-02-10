//import express
const express = require('express');
// import mongoose
const mongoose = require('mongoose');

//importing required packages
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressValidator = require('express-validator');


//allow env variables
require('dotenv').config();

//import routes
const user_routes = require('./routes/UserRoutes');
const package_routes = require('./routes/PackageRoutes');

const app = express();

//== middleware ==
//morgan will be running only in development
app.use(morgan('dev'));
//Used to receive json objects which have sent by the client
app.use(bodyParser.json());
//validator will be used to validate the incoming requests, index.js includes all validations
app.use(expressValidator());
//cross origin policy enabled
app.use(cors());

//== routes middleware ==
app.use('/api', user_routes);
app.use('/api', package_routes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server running at ${port}`);
})

//db connection
mongoose.connect(
    process.env.MONGO_URI,
    {useNewUrlParser: true}
)
    .then(() => console.log('DB Connected'));

mongoose.connection.on('error', err => {
    console.log(`DB connection error: ${err.message}`)
});