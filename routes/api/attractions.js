var express = require('express');
var router = express.Router();
module.exports = router;

var Hotel = require('../../models/hotel');
var Activity = require('../../models/activity');
var Restaurant = require('../../models/restaurant');

router.get('/hotels', function (req, res, next) {

    Hotel.findAll({})
        .then(function (hotels) {
            res.send(hotels);
        })
        .catch(next);

});

router.get('/restaurants', function (req, res, next) {

    Restaurant.findAll({})
        .then(function (restaurants) {
            res.send(restaurants);
        })
        .catch(next);

});

router.get('/activities', function (req, res, next) {

    Activity.findAll({})
        .then(function (activities) {
            res.send(activities);
        })
        .catch(next);

});