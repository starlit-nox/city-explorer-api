'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const data = require('../src/weather.json');
const fs = require('fs');

class Forecast {
    constructor(date, description) {
        this.date = date;
        this.description = description;
    }
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => {
    response.send('Page Not Found');
});

app.get('/weather', (request, response) => {
    const { lat, lon, city_name } = request.query;

    if (!lat || !lon || !city_name) {
        response.status(400).send('Required query parameters are missing');
        return;
    }

    const city = findCity(lat, lon, city_name);

    if (!city) {
        response.status(404).send('City not found');
        return;
    }

    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    const WEATHER_API_URL = `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${lat}&lon=${lon}`;

    axios
        .get(WEATHER_API_URL)
        .then((apiResponse) => {
            const weatherData = apiResponse.data;

            let weatherForecast = weatherData.data.map((data) => {
                return new Forecast(data.datetime, data.weather.description);
            });

            response.send(weatherForecast);
        })
        .catch((error) => {
            console.error('Error with weather data:', error);
            response.status(500).send('Error fetching weather data');
        });
});

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
    const city = cities.find((city) => {
        return (
            city.lat == lat &&
            city.lon == lon &&
            city.searchQuery.toLowerCase() == searchQuery.toLowerCase()
        );
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