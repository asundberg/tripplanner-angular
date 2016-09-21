$(function () {

    var map = initializeMap();
    var $addItemButton = $('#options-panel').find('button');

    var currentMarkers = [];

    var $listGroups = {
        hotel: $('#hotel-list').children('ul'),
        restaurant: $('#restaurant-list').children('ul'),
        activity: $('#activity-list').children('ul')
    };

    var $itinerary = $('#itinerary');

    var $addDayButton = $('#day-add');

    var $titleContainer = $('#day-title');
    var $dayTitle = $titleContainer.children('span');
    var $removeDayButton = $titleContainer.children('button');
    var $dayButtonList = $('.day-buttons');

    var days;
    var currentDayNum = 1;

    /*
     --------------------------
     END VARIABLE DECLARATIONS
     --------------------------
     */

    $addItemButton.on('click', function () {

        var $this = $(this);
        var $select = $this.siblings('select');
        var sectionName = $select.attr('data-type');
        var itemId = parseInt($select.val(), 10);

        switch (sectionName) {

            case 'hotel':
                addHotel(itemId);
                break;

            case 'restaurant':
                addRestaurant(itemId);
                break;

            case 'activity':
                addActivity(itemId);
                break;

            default:
                throw new Error('Unsupported attraction type!');
                break;

        }

    });

    $itinerary.on('click', 'button.remove', function () {

        var $this = $(this);
        var $item = $this.parents('li');
        var itemId = parseInt($item.attr('data-item-id'), 10);
        var sectionName = $item.parents('div').attr('id').split('-')[0];

        switch (sectionName) {

            case 'hotel':
                removeHotel(itemId);
                break;

            case 'restaurant':
                removeRestaurant(itemId);
                break;

            case 'activity':
                removeActivity(itemId);
                break;

            default:
                throw new Error('Unsupported attraction type!');
                break;

        }


    });

    $addDayButton.on('click', function () {

        var newDayNum = days.length + 1;

        addDay(newDayNum)
            .then(function () {
                switchDay(newDayNum);
            })
            .then(null, handleError);

    });

    $dayButtonList.on('click', '.day-btn', function () {
        var dayNumberFromButton = parseInt($(this).text(), 10);
        switchDay(dayNumberFromButton);
    });

    $removeDayButton.on('click', function () {

        removeCurrentDay()
            .then(function (allDays) {
                switchDay(1);
                recreateDays(allDays);
            })
            .then(null, handleError);

    });

    fillInOptions('hotels', $('#hotel-choices'));
    fillInOptions('restaurants', $('#restaurant-choices'));
    fillInOptions('activities', $('#activity-choices'));

    $.get('/days')
        .then(recreateDays)
        .then(null, function (response) {
            console.error(response);
        });

    /*
     --------------------------
     END NORMAL LOGIC
     --------------------------
     */

    // Server interaction

    function fillInOptions(collectionName, $selectElement) {
        $.get('/api/' + collectionName)
            .then(function (items) {
                items.forEach(function (item) {
                    $selectElement.append('<option value="' + item.id + '">' + item.name + '</option>');
                });
            })
    }

    function addDay(dayNum) {

        return $.post('/days', {
                number: dayNum
            })
            .then(function (allDays) {
                currentDayNum = dayNum;
                recreateDays(allDays);
            });

    }

    function removeCurrentDay() {

        var currentDay = days[currentDayNum - 1];

        return $.ajax({
            method: 'DELETE',
            url: '/days/' + currentDay.id
        });

    }

    function addHotel(hotelId) {

        var currentDay = days[currentDayNum - 1];

        $.post('/days/' + currentDay.id + '/hotel', {id: hotelId})
            .then(recreateDays)
            .then(null, handleError);

    }

    function addRestaurant(restaurantId) {

        var currentDay = days[currentDayNum - 1];

        $.post('/days/' + currentDay.id + '/restaurants', {
                id: restaurantId
            })
            .then(recreateDays)
            .then(null, handleError);

    }

    function addActivity(activityId) {

        var currentDay = days[currentDayNum - 1];

        $.post('/days/' + currentDay.id + '/activities', {
                id: activityId
            })
            .then(recreateDays)
            .then(null, handleError);

    }

    function removeHotel() {

        var currentDay = days[currentDayNum - 1];

        $.ajax({
                method: 'DELETE',
                url: '/days/' + currentDay.id + '/hotel'
            })
            .then(recreateDays)
            .then(null, handleError);

    }

    function removeRestaurant(restaurantId) {

        var currentDay = days[currentDayNum - 1];

        $.ajax({
                method: 'DELETE',
                url: '/days/' + currentDay.id + '/restaurants/' + restaurantId
            })
            .then(recreateDays)
            .then(null, handleError);

    }

    function removeActivity(activityId) {

        var currentDay = days[currentDayNum - 1];

        $.ajax({
                method: 'DELETE',
                url: '/days/' + currentDay.id + '/activities/' + activityId
            })
            .then(recreateDays)
            .then(null, handleError);

    }

    // Create element functions ----

    function create$item(item) {

        var $li = $('<li data-item-id="' + item.id + '" />');
        var $div = $('<div />');
        var $span = $('<span />').text(item.name);
        var $removeButton = $('<button class="btn btn-xs btn-danger remove btn-circle">x</button>');

        $li.append($div);
        $div.append($span).append($removeButton);

        return $li;

    }

    function createDayButton(number) {
        return $('<button class="btn btn-circle day-btn">' + number + '</button>');
    }

    // End create element functions ----

    // View render functions

    function recreateDays(allDays) {
        if (allDays) days = allDays;
        reRenderDayButtons();
        renderDay();
        mapFit();
    }

    function switchDay(dayNum) {
        currentDayNum = dayNum;
        $dayTitle.text('Day ' + dayNum);
        recreateDays();
    }

    function renderDay() {

        wipeDay();

        var currentDay = days[currentDayNum - 1];

        $dayButtonList
            .children('button')
            .eq(currentDayNum - 1)
            .addClass('current-day');

        renderHotel(currentDay.hotel);
        renderRestaurants(currentDay.restaurants);
        renderActivites(currentDay.activities);

    }

    function renderHotel(hotel) {

        if (!hotel) return;

        var $list = $listGroups.hotel;
        $list.append(create$item(hotel));
        currentMarkers.push(drawMarker(map, 'hotel', hotel.place.location));
    }

    function renderRestaurants(restaurants) {

        if (!restaurants) return;

        var $list = $listGroups.restaurant;

        restaurants.forEach(function (restaurant) {
            $list.append(create$item(restaurant));
            currentMarkers.push(drawMarker(map, 'restaurant', restaurant.place.location));
        });

    }

    function renderActivites(activities) {

        if (!activities) return;

        var $list = $listGroups.activity;

        activities.forEach(function (activity) {
            $list.append(create$item(activity));
            currentMarkers.push(drawMarker(map, 'activity', activity.place.location));
        });

    }

    function wipeDay() {

        $dayButtonList.children('button').removeClass('current-day');

        Object.keys($listGroups).forEach(function (key) {
            $listGroups[key].empty();
        });

        currentMarkers.forEach(function (marker) {
            marker.setMap(null);
        });

        currentMarkers = [];

    }

    function reRenderDayButtons() {

        var numberOfDays = days.length;

        $dayButtonList.children('button').not($addDayButton).remove();

        for (var i = 0; i < numberOfDays; i++) {
            $addDayButton.before(createDayButton(i + 1));
        }

    }

    function mapFit() {

        var bounds = new google.maps.LatLngBounds();

        currentMarkers.forEach(function (marker) {
            bounds.extend(marker.position);
        });

        map.fitBounds(bounds);

    }

    // ---------------------

    // Utility functions ------

    function handleError(err) {
        console.error(err);
    }

    // End utility functions ----

});
