queApp.controller('ConsultationsCtrl',
function($scope, VideoConsults, Availability, $state, Modals) {
    var weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    $scope.consultation = {};
    var currentDate = $scope.currentDate = new Date(),
        currentDayName = weekdays[currentDate.getDay() - 1];
    
    $scope.getAvailability = function () {
        $scope.gettingAvailability = true;
        Availability.getList()
        .then(function (response) {
            $scope.availability = response;
            $scope.currentDaySetting = _.findWhere($scope.availability, {day: currentDayName});
            $scope.currentDayAvailabilityTimes = $scope.currentDaySetting.availability_times;
        }, function (response) {
            $scope.availabilityGetErr = response.data.message;
        }).finally(function () {
            $scope.gettingAvailability = false;
        });
    };

    $scope.addVideoConsults = function () {
        var heading, message;
        Modals.loadingModal('Setting appointment').then(function (modal) {
            $scope.consultation.appointment = $scope.currentDaySetting.id;
            $scope.consultation.start_date = $scope.consultation.time.start_time;
            $scope.consultation.end_date = $scope.consultation.time.end_time;
            VideoConsults.post($scope.consultation)
            .then(function (response) {
                heading = 'Appointment set';
                message = 'Appointment has been set, a url for your video' +
                          'consultation has been sent to your email';
            }, function (reason) {
                heading = 'Error';
                message = reason.data.message;
            }).finally(function () {
                modal.scope.dismiss();
            });

            modal.closed.then(function () {
                Modals.messageModal(heading, message)
                .then(function (modal) {
                    if (heading != 'Error') {
                        modal.closed.then(function () {
                            $state.go('home');
                        });
                    }
                });
            });
        });
    };

    $scope.getAvailability();
})
