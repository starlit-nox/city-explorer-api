'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const data = require('../src/weather.json');
const fs = require('fs');

const app = express();
app.use(express.static(__dirname));
app.use(express.json());

app.use(
    cors({
        origin: 'https://city-explorer-ncc5.onrender.com',
    })
);

class Forecast {
    constructor(date, description) {
        this.date = date;
        this.description = description;
    }
}

class Movie {
    constructor(title, overview, releaseDate) {
        this.title = title;
        this.overview = overview;
        this.releaseDate = releaseDate;
    }
}

app.get('/', (request, response) => {
    response.send('Page Not Found');
});

app.get('/weather', async (request, response) => {
    const { lat, lon, city_name } = request.query;

    if (!lat || !lon || !city_name) {
        response.status(400).send('Required query parameters are missing');
        return;
    }

    try {
        const weatherData = await axios.get(
            `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${process.env.WEATHER_API_KEY}`
        );

        const dailyForecasts = weatherData.data.data.map((day) => {
            return new Forecast(day.datetime, day.weather.description);
        });

        response.send(dailyForecasts);
    } catch (error) {
        response.status(500).send(error.message);
    }
});

app.get('/movies', async (request, response) => {
    const { city_name } = request.query;

    if (!city_name) {
        response.status(400).send('City name is missing');
        return;
    }

    try {
        const movieData = await axios.get(
            `https://api.themoviedb.org/3/search/movie?query=${city_name}&api_key=${process.env.MOVIE_API_KEY}`
        );

        const localMovies = movieData.data.results.map((movie) => {
            return new Movie(movie.title, movie.overview, movie.release_date);
        });

        response.send(localMovies);
    } catch (error) {
        response.status(500).send(error.message);
    }
});

app.post('/weather', (request, response) => {
    const { city_name, valid_date, max_temp, min_temp, temp, description } = request.body;

    if (!city_name || !valid_date || !max_temp || !min_temp || !temp || !description) {
        response.status(400).send('Required parameters are missing');
        return;
    }

    const locateWeather = {
        city_name: city_name,
        valid_date: valid_date,
        max_temp: max_temp,
        min_temp: min_temp,
        temp: temp,
        description: description,
    };

    const updateWeatherData = [...data, locateWeather];

    fs.writeFile('test.json', JSON.stringify(updateWeatherData), (err) => {
        if (err) {
            console.log(err);
            response.status(500).send('Error saving weather data');
        } else {
            console.log('Weather data saved successfully');
            response.send('Success');
        }
    });
});

app.get('*', (request, response) => {
    response.status(404).send('City not found.');
});

app.use((error, request, response, next) => {
    console.error(error);
    response.status(500).send('City Explorer is not working!');
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
