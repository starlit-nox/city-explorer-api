const axios = require('axios');
const fs = require('fs');

class Forecast {
    constructor(date, description) {
        this.date = date;
        this.description = description;
    }
}

async function getWeather(lat, lon) {
    try {
        const weatherData = await axios.get(
            `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${process.env.WEATHER_API_KEY}`
        );

        const dailyForecasts = weatherData.data.data.map((day) => {
            return new Forecast(day.datetime, day.weather.description);
        });

        console.log('Weather:', dailyForecasts); // Log weather as an array

        return dailyForecasts;
    } catch (error) {
        console.error('Error retrieving weather data:', error);
        throw new Error('Error retrieving weather data');
    }
}

function saveWeatherData(data) {
    const updateWeatherData = [...data];

    fs.writeFile('test.json', JSON.stringify(updateWeatherData), (err) => {
        if (err) {
            console.error('Error saving weather data:', err);
            throw new Error('Error saving weather data');
        } else {
            console.log('Weather data saved successfully');
        }
    });
}

module.exports = {
    getWeather,
    saveWeatherData,
};
