const axios = require('axios'); // this imports the axios library
// axios is used to make http requests (aka get the site to work)
const fs = require('fs'); // this lets the app read and write code
const cache = require('./cache.js'); // this imports the cache  to retrieve & cache(save) weather data

// constructor class for weather API
class Forecast {
    constructor(date, description) {
        this.date = date; //parameter
        this.description = description; //parameter
    }
}

// axios function 
// params are lat and lon of it
async function getWeather(lat, lon) {
    // using key as an indeitifer for the cache
    const key = `weather-${lat}-${lon}`;

    // this reads if the key for current date is less than 60 seconds old then it'll be cached and used
    if (cache[key] && Date.now() - cache[key].timestamp < 60000) {
        console.log('Cache successful');
        // this means its a hit :>
        return cache[key].data;
    } else {
        console.log('Cache unsuccessful');
        // this means its a miss :<
        try {
            //api stuff to retrieve the weather data
            const weatherData = await axios.get(
                `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${process.env.WEATHER_API_KEY}`
            );
            // another variable for the weather API to get daily forecasts
            // map creates an array using datetime and description
            const dailyForecasts = weatherData.data.data.map((day) => {
                return new Forecast(day.datetime, day.weather.description);
            });
            // cache key is for the current date and the current forecast (of the day)
            cache[key] = {
                timestamp: Date.now(),
                data: dailyForecasts,
            };

            console.log('Weather:', dailyForecasts); // this logs weather as an array in the console

            return dailyForecasts;
        } catch (error) {
            // this is the error if the api doesn't work retrieving the cache
            console.error('Error retrieving weather data:', error);
            // new makes a new object (error is the obj)
            throw new Error('Error retrieving weather data');
        }
    }
}
// this function is made to save the weather data
function saveWeatherData(data) {
    const updateWeatherData = [...data]; // creates a copy of the data array

    // data gets saved in test.json
    fs.writeFile('test.json', JSON.stringify(updateWeatherData), (err) => {
        if (err) {
            console.error('Error saving weather data:', err);
            throw new Error('Error saving weather data');
        } else {
            console.log('Weather data saved successfully');
        }
    });
}

// exporting the modules
module.exports = {
    getWeather,
    saveWeatherData,
};