queApp.controller('ConsultationsCtrl',
function($scope, VideoConsults, $mdDialog, TodayTimes, Availability, $mdDialog, $state) {
    console.log(VideoConsults);

    $scope.todayTime = TodayTimes;
    $scope.consultation = {};

    var AppearIn = window.AppearIn;
    var appearin = new AppearIn();

    $scope.todayTime.hours = _.sortBy($scope.todayTime.hours, 'start_time');

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
})
