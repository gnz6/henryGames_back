const { Genre } = require("../db");
const baseUrl = "https://api.rawg.io/api/";
const { API_KEY } = process.env;
const Sequelize = require("sequelize");
const { where } = require('sequelize');
const axios = require("axios")

const getGenres = async (req, res) => {
    try {
        const allGenres = await Genre.findAll();
        if(!allGenres.length){

            const genresUrl = await axios.get(`${baseUrl}genres?key=${API_KEY}`)
            let genres = await genresUrl.data
            let results = genres.results.map(r => {
                return { name: r.name }
            })
            // console.log(results);
            for (let i = 0; i < results.length; i++) {
                where: { name: results[i].name }
                await Genre.findOrCreate({
                });
            
            }
        res.status(200).send(allGenres)

        }
        res.status(200).send(allGenres)

    } catch (err) {
        console.log(err);
        return res.status(400).json({err})
    }
}


module.exports = { getGenres }