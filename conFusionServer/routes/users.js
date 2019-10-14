const express = require("express");

const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const User = require("../models/user");
const cors = require("./cors");

const authenticate = require("../authenticate");

router.use(bodyParser.json());

router
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
      .then(
        users => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(users);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

router
  .route("/signup")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.cors, (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save(user_err => {
          if (user_err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ user_err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    });
  });

router
  .route("/login")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.cors, passport.authenticate("local"), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token,
      status: "You are successfully logged in!"
    });
  });

router.get("/facebook/token", passport.authenticate("facebook-token"), (req, res) => {
  console.log("I AM HERE");
  console.log(req);
  if (req.user) {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, token, status: "You are successfully logged in!" });
  }
});

router
  .route("/logout")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    if (req.session) {
      req.session.destroy();
      res.clearCookie("session-id");
      res.redirect("/");
    } else {
      const err = new Error("You are not logged in!");
      err.status = 403;
      next(err);
    }
  });
module.exports = router;
