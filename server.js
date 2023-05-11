'use strict';

require('dotenv').config(); // enables process.env
const express = require('express');
const cors = require('cors');
const data = require('./data/weather.json'); // read in the list

class Forecast { // create a class for Forecast with date and description properties
    constructor(date, description) {
        this.date = date;
        this.description = description;
    }
}

const app = express(); // initializes app
app.use(cors()); // allows cross-origin resource sharing

// this receives all requests and tells it what to do
app.get('/weather', (request, response) => {
    const { lat, lon, city_name } = request.query;
console.log(lat)
console.log(lon)
console.log(city_name)

    // check if required parameters are missing
    if (!lat || !lon || !city_name) {
        response.status(400).send('Required query parameters are missing');
        return;
    }

    // find the city that matches the query parameters
    const city = findCity(lat, lon, city_name);

    // if city is not found, return an error
    if (!city) {
        response.status(404).send('City not found');
        return;
    }

    // find the weather for the city
    const weather = findWeather(city.city_name);

    // if weather is not found, return an error
    if (weather) {
        response.status(404).send('Weather not found');
        return;
    }

    // create an array of Forecast objects for each day of the week
    const forecasts = weather.data.map(day => new Forecast(day.datetime, day.weather.description));

    // send the weather data as response
    response.send({
        city: city.city_name,
        description: weather.weather.description,
        temperature: weather.temp,
        forecasts: forecasts // add the forecasts array to the response
    });
});

// function to find the city that matches the query parameters
// don't use this.props for arrays b/c its a react.js front end method
function findCity(lat, lon, searchQuery) {
    const cities = [
        {
            lat: data[0].lat,
            lon: data[0].lon,
            searchQuery: data[0].city_name,
        },
        {
            lat: data[1].lat,
            lon: data[1].lon,
            searchQuery: data[1].city_name,
        },
        {
            lat: data[2].lat,
            lon: data[2].lon,
            searchQuery: data[2].city_name,
        },
    ];
    const city = cities.find(
        (city) => {
            return city.lat === lat && city.lon === lon && city.searchQuery.toLowerCase() === searchQuery.toLowerCase()
        });
    return city;
}

// function to find the weather for a given city
function findWeather(searchQuery) {
    const weather = data.find((w) => w.city_name.toLowerCase() === searchQuery.toLowerCase());
    return weather;
}

// configure 404 error
app.get('*', (request, response) => {
    response.status(404).send('City not found.');
});

// this handles the middleware for the app
app.use((error, request, response, next) => {
    console.error(error);
    response.status(500).send('City Explorer is not working!');
});

// this starts the server
app.listen(3001, () => console.log('listening on 3001'));
