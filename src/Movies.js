const axios = require('axios');

class Movie {
    constructor(title, overview, releaseDate) {
        this.title = title;
        this.overview = overview;
        this.releaseDate = releaseDate;
    }
}

async function searchMovies(query) {
    try {
        const movieData = await axios.get(
            `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${process.env.MOVIE_API_KEY}`
        );

        const localMovies = movieData.data.results.map((movie) => {
            return new Movie(movie.title, movie.overview, movie.release_date);
        });

        console.log('Movies:', localMovies); // Log movies as an array

        return localMovies;
    } catch (error) {
        console.error('Error retrieving movie data:', error);
        throw new Error('Error retrieving movie data');
    }
}

module.exports = {
    searchMovies,
};
