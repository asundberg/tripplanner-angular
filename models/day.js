var Sequelize = require('sequelize');
var Promise = require('bluebird');
var db = require('./_db');

var Day = db.define('day', {
    number: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    hooks: {
        beforeDestroy: function (dayBeingDeleted) {

            return this.findAll({
                    where: {
                        number: {
                            $gt: dayBeingDeleted.number
                        }
                    }
                })
                .then(function (daysAfter) {

                    var numbersUpdating = daysAfter.map(function (day) {
                        day.number = day.number - 1;
                        return day.save();
                    });

                    return Promise.all(numbersUpdating);

                });

        }
    }
});

module.exports = Day;