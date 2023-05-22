'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
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

        console.log('Weather:', dailyForecasts); // Log weather as an array

        response.send(dailyForecasts);
    } catch (error) {
        console.error('Error retrieving weather data:', error);
        response.status(500).send('Error retrieving weather data');
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
            console.error('Error saving weather data:', err);
            response.status(500).send('Error saving weather data');
        } else {
            console.log('Weather data saved successfully');
            response.send('Success');
        }
    });
});

app.get('/movies', async (request, response) => {
    const { searchquery } = request.query;

    if (!searchquery) {
        response.status(400).send('City name is missing');
        return;
    }

    try {
        const movieData = await axios.get(
            `https://api.themoviedb.org/3/search/movie?query=${searchquery}&api_key=${process.env.MOVIE_API_KEY}`
        );

        const localMovies = movieData.data.results.map((movie) => {
            return new Movie(movie.title, movie.overview, movie.release_date);
        });

        console.log('Movies:', localMovies); // Log movies as an array

        response.send(localMovies);
    } catch (error) {
        console.error('Error retrieving movie data:', error);
        response.status(500).send('Error retrieving movie data');
    }
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
