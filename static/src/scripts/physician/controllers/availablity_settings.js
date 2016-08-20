quePhysicianApp.controller('AvailabilitySettingCtrl',
function ($scope, AvailabilityTimes, AvailabilitySettings) {
    $scope.getAvailabilityTimes = function () {
        if ($scope.availabilityTimes && $scope.availabilityTimes.length > 0) return;

        $scope.gettingAvailabilityTimes = true;
        AvailabilityTimes.getList()
        .then(function (response) {
            $scope.availabilityTimes = response;
        }, function (response) {
            $scope.getAvailabilityErr = response.data.message;
        }).finally(function () {
            $scope.gettingAvailabilityTimes = false;
        });
    };

    $scope.getAvailabilitySettings = function () {
        $scope.gettingSettings = true;
        AvailabilitySettings.getList().then(function (response) {
            $scope.availabilitySettings = response;
        }, function (response) {
            $scope.getAvailabilityErr = response.data.message;
        }).finally(function () {
            $scope.gettingSettings = false;
        });
    };

    function saveSetting (setting) {
        $scope.savingSettings = true;

        setting.put()
        .then(function (response) {
            setting = response;
        }, function (reason) {
            $scope.saveSettingError = reason.data.message;
        }).finally(function () {
            $scope.savingSettings = false;
        });
    };
    $scope.saveSetting = saveSetting;

    $scope.toggleHour = function (setting, availabilityTime) {
        var idx = _.findLastIndex(setting.availability_times, {'title': availabilityTime.title});
        if (idx == -1) {
            setting.availability_times.push(availabilityTime);
        } else {
            setting.availability_times.splice(idx, 1);
        }
        saveSetting(setting);
    };

    $scope.exists = function (setting, availabilityTimeTitle) {
        var idx = _.findLastIndex(setting.availability_times, {'title': availabilityTimeTitle});
        return idx > -1;
    };

    $scope.toggleRepeatWeekly = function (setting) {
        setting.repeat_weekly = !setting.repeat_weekly;
        saveSetting(setting);
    };

    $scope.getAvailabilitySettings();
});