quePhysicianApp.controller('VideoConsultsCtrl', function ($scope, VideoConsults) {
    $scope.getConsults = function () {
        $scope.gettingVideoConsults = true;
        VideoConsults.getList()
        .then(function (response) {
            $scope.videoConsults = response;
        }, function (reason) {
            $scope.videoConsultsGetErr = reason.data.message;
        }).finally(function () {
            $scope.gettingVideoConsults = false;
        });
    };
});