quePhysicianApp.controller('AvailabilitySettingCtrl',
function ($scope, Hours, AvailabilitySettings) {
    $scope.getHours = function () {
        if ($scope.hours) return;

        $scope.gettingHours = true;
        Hours.getList()
        .then(function (response) {
            $scope.hours = response;
        }, function (response) {
            $scope.getHoursErr = response.data.message;
        }).finally(function () {
            $scope.gettingHours = false;
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
            _.extend(setting, response);
        }, function (reason) {
            $scope.saveSettingError = reason.data.message;
        }).finally(function () {
            $scope.savingSettings = false;
        });
    };
    $scope.saveSetting = saveSetting;

    $scope.toggleHour = function (setting, hourId) {
        var idx = setting.hours.indexOf(hourId);
        if (idx == -1) {
            setting.hours.push(hourId);
        } else {
            setting.hours.splice(idx, 1);
        }
        saveSetting(setting);
    };

    $scope.exists = function (setting, hourId) {
        return setting.hours.indexOf(hourId) > -1;
    };

    $scope.toggleRepeatWeekly = function (setting) {
        setting.repeat_weekly = !setting.repeat_weekly;
        saveSetting(setting);
    };

    $scope.getAvailabilitySettings();
});