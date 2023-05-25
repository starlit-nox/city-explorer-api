const axios = require('axios');
const cache = require('./cache.js');

// constructor class for movie API
class Movie {
    constructor(title, overview, releaseDate) {
        this.title = title;
        this.overview = overview;
        this.releaseDate = releaseDate;
    }
}

// axios function 
// params are query of it (searching movies)
async function searchMovies(query) {
        // using key as an indeitifer for the cache
    const key = `movies-${query}`;

        // this reads if the key for current date is less than 60 seconds old then it'll be cached and used
    if (cache[key] && Date.now() - cache[key].timestamp < 60000) {
        console.log('Cache successful');
        return cache[key].data;
    } else {
        console.log('Cache unsuccessful');
        try {
           //api stuff to retrieve the movie data
           // its using axios get to grab the data from the api and the params (query) -- if its successful
            const movieData = await axios.get(
                `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${process.env.MOVIE_API_KEY}`
            );
                // its mapping the array for the movie's data: title, overview, release
            const localMovies = movieData.data.results.map((movie) => {
                return new Movie(movie.title, movie.overview, movie.release_date);
            });
            // cache key is for the current date and the current movies (top local ones)
            cache[key] = {
                timestamp: Date.now(),
                data: localMovies,
            };

            console.log('Movies:', localMovies); // this logs movies as an array

            return localMovies;
        } catch (error) {
            console.error('Error retrieving movie data:', error);
            throw new Error('Error retrieving movie data');
        }
    }
}


// exporting the modules
module.exports = {
    searchMovies,
};