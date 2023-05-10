`use strict`

// use npm run start in a backend terminal to run this

// require is a node function (back end library)
// import is a react.js function (front end library)

require('dotenv').config(); //enables process.env,
const express = require("express");
const cors = require('cors');
// read in the list
const data = require(`./data/weather.json`)

// initializes app
const app = express();

app.use(cors());

// this recieves all requests and tells it what to do


// configure 404 error
app.get('*',(request,response) => {
    response.status(404).send('City cannot be explored.');
});

// this handles the middleware for the app
app.use((error,request, response, next) => {
    console.error(error);
    response.status(500).send(error.message);
});

// this is starting the server
app.listen(3001, () => console.log('listening on 3001'));



