const { Router } = require('express');
const router = Router();
const {getAllGames, createGame, getDetail} = require("../controllers/index")
const {getGenres} = require("../controllers/genres.js")


router.get("/videogames", getAllGames);

router.get("/genres", getGenres);

router.post("/videogames", createGame);

router.get("/videogames/:id", getDetail);

router.delete("/videogames/:id", getDetail);


module.exports = router;
