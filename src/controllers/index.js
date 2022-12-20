const axios = require('axios').default;
const { Videogame, Genre } = require("../db");
const baseUrl = "https://api.rawg.io/api/";
// const Sequelize = require("sequelize");
// const { where } = require('sequelize');
// const { Router } = require('express');
const { API_KEY } = process.env;
// const e = require('express');
// const {Op} = Sequelize;


//Controllers

//getting games from Api

const getApiGames = async (req, res) => {

    const links = [(`${baseUrl}games?key=${API_KEY}&page=1`),
    (`${baseUrl}games?key=${API_KEY}&page=2`),
    (`${baseUrl}games?key=${API_KEY}&page=3`),
    (`${baseUrl}games?key=${API_KEY}&page=4`),
    (`${baseUrl}games?key=${API_KEY}&page=5`)
    ];

    const promises = links.map(url => axios.get(url).then(resp => resp.data.results));

    let apiGames = Promise.all(promises)
        .then(resp => resp.map(r => r))
        .then(resp => resp.flat())
        .then(res => res.map(game => {
            return {
                id: game.id,
                name: game.name,
                description: game.description_raw,
                platforms: game.platforms.map(p => p.platform.name),
                image: game.background_image,
                released: game.released,
                rating: game.rating,
                genres: game.genres.map(gr => gr.name),
                createdInDb: false
            }
        }
        )).catch(err => {
            console.log(err)
            return res.status(400).json({ error: err })
        })

    return apiGames;
}


//Getting games from DB

const getDbGames = async () => {
    const dbGames = await Videogame.findAll({
        include: {
            model: Genre,
            attributes: ["name"],
            through: { attributes: [] },
        }
    })

    let formattedDbGames = dbGames.map(game => {
        return {
            id: game.id,
            name: game.name,
            description: game.description,
            platforms: game.platforms,
            image: game.image,
            rating: game.rating,
            genres: game.genres.map(g => g.name),
            createdInDb: true
        }
    })
    return formattedDbGames;
}

// Api & db games concat

const getAllGames = async (req, res) => {
    const { name } = req.query;
    try {
        const apiGames = await getApiGames()
        const dbGames = await getDbGames();
        const allGames = apiGames.concat(dbGames);
        if (!name) return res.status(200).send(allGames)

        let game = await allGames.filter(game => game.name.toLowerCase().includes(name.toLowerCase()))
        if (!game.length) return res.status(200).send({ error: "No Games Found" })
        return res.status(200).send(game)


    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error })
    }
}

// Detail Controller

const getDetail = async (req, res) => {
    const { id } = req.params;
    if (id.length < 8) {
        let detailUrl = await axios.get(`${baseUrl}games/${id}?key=${API_KEY}`)
        let gamesApi = await detailUrl.data;

        let gameDetail = {
            name: gamesApi.name,
            description: gamesApi.description_raw,
            image: gamesApi.background_image,
            released: gamesApi.released,
            rating: gamesApi.rating,
            platforms: gamesApi.platforms.map(p => p.platform.name),
            genres: gamesApi.genres.map(g => g.name),
            id: id
        };
        return res.status(200).json({gameDetail});
    }
    else {
        let dbGame = await Videogame.findAll({
            where: { id: id },
            include: [
                {
                    model: Genre,
                    attributes: ["name"],
                    through: { attributes: [] },
                }
            ]
        });
        let gameId = dbGame.find(game => game.id == id);

        let gameDetail = {
            id: gameId.dataValues.id,
            name: gameId.dataValues.name,
            description: gameId.dataValues.description,
            image: gameId.dataValues.image,
            released: gameId.dataValues.released,
            rating: gameId.dataValues.rating,
            platforms: gameId.dataValues.platforms,
            genres: gameId.dataValues.genres.map(g => g.dataValues.name)
        }
        return res.status(200).send(gameDetail);
    }
}

//createGame controller

const createGame = async (req, res) => {
    const { name, description, image, released, rating, platforms, genres } = req.body
    if (!name || !platforms || !description) throw new Error("Missing required parameters")

    try {
        const newGame = await Videogame.create({
            name, description, image, released, rating, platforms, genres
        });

        const genre = await Genre.findAll({
            where: { name: genres }
        });

        await newGame.addGenre(genre);
        return res.status(200).send( newGame )
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error })
    }

};


//deleteGame Controller


const deleteGame = async (req, res) => {
    const {id} = req.params;
    try {
        await Videogame.destroy({ where: { id: id } });
        return res.status(200).send("Game Deleted")
    } catch (error) {
        console.log(error);
        return res.status(400).json({error})        
    }
};


module.exports = { createGame, getAllGames, getDetail, deleteGame }