'use strict';

require('dotenv').config(); // enables process.env
const express = require('express');
const cors = require('cors');
const data = require('../src/weather.json'); // read in the list
const fs = require('fs'); // this lets us read and write the code
const { error } = require('console');


class Forecast { // create a class for Forecast with date and description properties
    constructor(date, description) {
        this.date = date;
        this.description = description;
    }
}

const app = express(); // initializes app

app.use(cors()); // allows cross-origin resource sharing
app.use(express.json());

app.get(`/`, (request, response) => {
    response.send("Page Not Found");
});

// this receives all requests and tells it what to do
app.get('/weather', (request, response) => {
    const { lat, lon, city_name } = request.query;

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

    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    const WEATHER_API_URL = `https://api.weatherbit.io/v2.0/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`;  

    axios //this is importing axios
    .get (WEATHER_API_URL) //this gets the weather api url (which has the API key in it)
    .then((apiResonse) => {
        const weatherData = apiResonse.data; //this is getting the data from the website's weather data forecast

    let weatherForecast = weatherData.data.map((data) => {
        return new Forecast(data.valid_date, data.weather.description);
    });
        // sending the weather response to 3000 (front end)
    response.send(weatherForecast); 
    })
});

    // find the weather for the city
    const weather = findWeather(city.searchQuery);

    // if weather is not found, return an error
    if (!weather) {
        response.status(404).send('Weather not found');
        return;
    }

    // sending the weather response to 3000 (front end)

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
            return city.lat == lat && city.lon == lon && city.searchQuery.toLowerCase() == searchQuery.toLowerCase();
        });
    return city;
}

// function to find the weather for a given city
function findWeather(searchQuery) {
    const weather = data.find((w) => w.city_name.toLowerCase() == searchQuery.toLowerCase());
    return weather;
}

// http://localhost:3001/weather?city_name=something
app.post('/weather', (request, response) => {
    let locateWeather = {
        "city_name": request.body.city_name,
        "valid_date": request.body.valid_date,
        "max_temp:": request.body.max.temp,
        "min_temp": request.body.min.temp,
        "temp": request.body.temp,
        "description": request.body.description
    };
    let updateWeatherData = data;
    updateWeatherData.push(locateWeather);

    // this is writing in the file
    // its passing through the params
    fs.writeFile("test", JSON.stringify(updateWeatherData), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("This fs test was saved!");
    });

    response.send('Success');
});

// configure 404 error (router)
app.get('*', (request, response) => {
    response.status(404).send('City not found.');
});

// this handles the middleware for the app (router)
app.use((error, request, response, next) => {
    console.error(error);
    response.status(500).send('City Explorer is not working!');
});

// this starts the server (router)
app.listen(3003, () => console.log('listening on 3003'));

