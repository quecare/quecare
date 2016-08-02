queApp.controller('ConsultationsCtrl',
function($scope, VideoConsults, Availability, $state) {
    $scope.consultation = {};
    $scope.currentDate = new Date();
    $scope.currentDate.setMinutes(0);
    $scope.currentDate.setSeconds(0);

    $scope.getAvailability = function () {
        $scope.gettingAvailability = true;
        Availability.getList()
        .then(function (response) {
            $scope.availability = response;
            getAvailableTime();
        }, function (response) {
            $scope.availabilityGetErr = response.data.message;
        }).finally(function () {
            $scope.gettingAvailability = false;
        });
    };

    var weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    function getAvailableTime () {
        var currentDate = new Date(), selectedDay;
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);
        var day = weekday[currentDate.getDay()]
        $scope.currentDay = _.findWhere($scope.availability, {'day': day});
        for (var i in $scope.currentDay.hours) {
            var hour = $scope.currentDay.hours[i];
            hour.start_time = new Date(currentDate.setHours(hour.start_time));
            hour.end_time = new Date(currentDate.setHours(hour.end_time));
        }
    };

//    $scope.todayTime.hours = _.sortBy($scope.todayTime.hours, 'start_time');

    $scope.addVideoConsults = function () {
        $scope.setting = true;
        appearin.getRandomRoomName().then(function (roomName) {
            $scope.consultation.room_name = roomName;
            $scope.consultation.appointment = $scope.todayTime.id;
            $scope.consultation.date_for = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            VideoConsults.post($scope.consultation)
            .then(function (response) {
                $mdDialog.show(
                    $mdDialog.alert({
                        title: 'Appointment set',
                        textContent: 'Appointment has been set, a url for your video' +
                                     'consultation has been sent to your email',
                        ok: 'Close'
                    })
                ).then(function () {
                    $state.go('home');
                })
            }, function (reason) {
                $mdDialog.show(
                    $mdDialog.alert({
                        title: 'Error',
                        textContent: reason.data.message,
                        ok: 'Close'
                    })
                );
            }).finally(function () {
                $scope.setting = false;
            });
        });
    };

    $scope.getAvailability();
})
