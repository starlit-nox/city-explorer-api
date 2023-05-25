const axios = require('axios');
const cache = require('./cache.js');

class Movie {
    constructor(title, overview, releaseDate) {
        this.title = title;
        this.overview = overview;
        this.releaseDate = releaseDate;
    }
}

async function searchMovies(query) {
    const key = `movies-${query}`;

    if (cache[key] && Date.now() - cache[key].timestamp < 60000) {
        console.log('Cache hit');
        return cache[key].data;
    } else {
        console.log('Cache miss');
        try {
            const movieData = await axios.get(
                `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${process.env.MOVIE_API_KEY}`
            );

            const localMovies = movieData.data.results.map((movie) => {
                return new Movie(movie.title, movie.overview, movie.release_date);
            });

            cache[key] = {
                timestamp: Date.now(),
                data: localMovies,
            };

            console.log('Movies:', localMovies); // Log movies as an array

            return localMovies;
        } catch (error) {
            console.error('Error retrieving movie data:', error);
            throw new Error('Error retrieving movie data');
        }
    }
}

module.exports = {
    searchMovies,
};