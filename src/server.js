'use strict';

require('dotenv').config(); // enables process.env
const express = require('express');
const cors = require('cors');
const weather = require('./Weather');
const movies = require('./Movies');

const app = express(); // initializes app
app.use(express.static(__dirname)); // note here
app.use(express.json());

app.use(
    cors({
        origin: 'https://city-explorer-ncc5.onrender.com',
    })
);

app.get('/', (request, response) => {
    response.send('Page Not Found');
});

// this recieves all weather requests and tells the code what to do with it
app.get('/weather', async (request, response) => {
    // its searching for the lat, lon, and city-name and requesting those params
    const { lat, lon, city_name } = request.query;
    // this is the 400 error letting the user know the params weren't added are missing
    if (!lat || !lon || !city_name) {
        response.status(400).send('City not found. Parameters are missing.');
        return;
    }

    try {
        const dailyForecasts = await weather.getWeather(lat, lon);

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

    // Assuming you have the "data" array defined somewhere
    const updateWeatherData = [...data, locateWeather];

    weather.saveWeatherData(updateWeatherData);

    response.send('Success');
});

// this recieves all requests from the movie API and tells the code what to do with it
app.get('/movies', async (request, response) => {
    const { searchquery } = request.query;

    if (!searchquery) {
        response.status(400).send('City name is missing');
        return;
    }

    try {
        const localMovies = await movies.searchMovies(searchquery);

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
