var express = require('express');
var router = express.Router();
var Day = require('../../models/day');
var Hotel = require('../../models/hotel');
var Restaurant = require('../../models/restaurant');
var Activity = require('../../models/activity');
var Promise = require('bluebird');
module.exports = router;

function getAllDays() {
    return Day.findAll({
        include: [Hotel, Restaurant, Activity],
        order: 'number ASC'
    });
}

router.get('/', function (req, res, next) {

    getAllDays()
        .then(function (days) {
            if (days.length === 0) {
                return Day.create({number: 1}).then(function (createdDay) {
                    return [createdDay];
                });
            } else {
                return days;
            }
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);

});

router.post('/', function (req, res, next) {

    Day.create(req.body)
        .then(function (createdDay) {
            return getAllDays();
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);

});

router.delete('/:dayId', function (req, res, next) {

    Day.destroy({
            where: {
                id: req.params.dayId
            }
        })
        .then(function () {
            return getAllDays();
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);

});

router.post('/:dayId/hotel', function (req, res, next) {

    Promise.all([
            Day.findById(req.params.dayId),
            Hotel.findById(req.body.id)
        ])
        .spread(function (day, hotel) {
            return day.setHotel(hotel);
        })
        .then(function () {
            return getAllDays();
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);

});

router.post('/:dayId/restaurants', function (req, res, next) {
    Promise.all([
            Day.findById(req.params.dayId),
            Restaurant.findById(req.body.id)
        ])
        .spread(function (day, restaurant) {
            return day.addRestaurant(restaurant);
        })
        .then(function () {
            return getAllDays();
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);
});

router.post('/:dayId/activities', function (req, res, next) {
    Promise.all([
            Day.findById(req.params.dayId),
            Activity.findById(req.body.id)
        ])
        .spread(function (day, activity) {
            return day.addActivity(activity);
        })
        .then(function () {
            return getAllDays();
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);
});

router.delete('/:dayId/hotel', function (req, res, next) {
    Day.findById(req.params.dayId)
        .then(function (day) {
            return day.setHotel(null);
        })
        .then(function () {
            return getAllDays();
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);
});

router.delete('/:dayId/restaurants/:restId', function (req, res, next) {
    Promise.all([
            Day.findById(req.params.dayId),
            Restaurant.findById(req.params.restId)
        ])
        .spread(function (day, restaurant) {
            return day.removeRestaurant(restaurant);
        })
        .then(function () {
            return getAllDays();
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);
});

router.delete('/:dayId/activities/:actId', function (req, res, next) {
    Promise.all([
            Day.findById(req.params.dayId),
            Activity.findById(req.params.actId)
        ])
        .spread(function (day, activity) {
            return day.removeActivity(activity);
        })
        .then(function () {
            return getAllDays();
        })
        .then(function (days) {
            res.send(days);
        })
        .catch(next);
});