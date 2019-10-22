const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorites = require("../models/favorites");
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then(
                favorites => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorites);
                }
            )
            .catch(err => next(err));
    })
    .post(
        cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
            Favorites.findOne({ user: req.user._id })
                .then(favorites => {
                    if (favorites != null) {
                        console.log('user already has favorites');
                        req.body.forEach(newdish => {
                            if (favorites.dishes.indexOf(newdish._id) === -1) {
                                favorites.dishes.push(newdish);
                            }
                        });
                        favorites.save()
                            .then(
                                favorite_saved => {
                                    console.log("Favorite updated ", favorite_saved);
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(favorite_saved);
                                },
                                err => next(err)
                            )
                            .catch(err => next(err));
                    } else {
                        console.log('this user doesn\'t have favorites');
                        const new_favorites = new Favorites({
                            user: req.user._id,
                            dishes: req.body
                        });
                        new_favorites.save()
                            .then(
                                favorite_saved => {
                                    console.log("Favorites created ", favorite_saved);
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(favorite_saved);
                                },
                                err => next(err)
                            )
                            .catch(err => next(err));
                    }

                })
        }
    )
    .put(
        cors.corsWithOptions, authenticate.verifyUser, (_, res) => {
            res.statusCode = 403;
            res.end("PUT operation not supported on /favorites");
        }
    )
    .delete(
        cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
            Favorites.deleteOne({ user: req.user._id })
                .then(
                    favorites_deleted => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorites_deleted);
                    },
                    err => next(err)
                )
                .catch(err => next(err));
        }
    );

favoriteRouter
    .route("/:dishid")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then(
                favorites => {
                    if (favorites != null) {
                        console.log('user has favorites');
                        if (favorites.dishes.indexOf(req.params.dishid) === -1) {
                            favorites.dishes.push(req.params.dishid);
                            favorites.save()
                                .then(
                                    favorite_saved => {
                                        console.log("Favorite updated ", favorite_saved);
                                        res.statusCode = 200;
                                        res.setHeader("Content-Type", "application/json");
                                        res.json(favorite_saved);
                                    },
                                    err => next(err)
                                )
                                .catch(err => next(err));
                        } else {
                            console.log("Favorite already exists");
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorites);
                        }
                    } else {
                        console.log("The user doesn't have any favorites");
                        const new_favorites = new Favorites({
                            user: req.user._id,
                            dishes: [req.params.dishid]
                        });
                        new_favorites.save()
                            .then(
                                favorite_saved => {
                                    console.log("Favorites created ", favorite_saved);
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(favorite_saved);
                                },
                                err => next(err)
                            )
                            .catch(err => next(err));
                    }
                },
                err => next(err)
            )
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then(
                favorites => {
                    if (favorites != null) {
                        const new_dishes = favorites.dishes
                            .filter(dishid => dishid !== req.params.dishid)
                        Favorites.update({ user: req.user._id },
                            { $set: { dishes: new_dishes } })
                            .then(
                                status_update => {
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(status_update);
                                },
                                err => next(err)
                            )
                            .catch(err => next(err));
                    } else {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json("No favorites");
                    }
                },
                err => next(err)
            )
            .catch(err => next(err));
    });

module.exports = favoriteRouter;