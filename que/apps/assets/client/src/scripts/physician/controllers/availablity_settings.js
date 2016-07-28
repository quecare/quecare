quePhysicianApp.controller('AvailabilitySettingCtrl',
function ($scope, Hours, AvailabilitySettings) {
    Hours.getList()
    .then(function (response) {
        $scope.hours = response;
    });

    AvailabilitySettings.getList().then(function (response) {

        if (response.length < 7) {
            var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            var alreadySetDays = _.map(response, function (setting) {
                var day = setting.day;
                if (day) {
                    return day;
                }
            });

            $scope.availabilitySettings = response;
            var missingDays = _.difference(days, alreadySetDays);
            for (i=0; i<missingDays.length; i++) {
                var setting = _.extend({day: missingDays[i]}, AvailabilitySettings.one());
                $scope.availabilitySettings.push(setting);
            }
        }
    });

    $scope.saveSetting = function (setting) {
        if (setting.id) {
            return setting.put()
                .then(function (response) {
                    _.extend(setting, response);
                });
        } else {
            return AvailabilitySettings.post(setting)
               .then(function (response) {
                    _.extend(setting, response);
               });
        }
    };

    function DialogCtrl ($scope, $mdDialog, setting, hours, saveSetting) {
        $scope.setting = setting;
        $scope.setting.hours = $scope.setting.hours || [];
        $scope.hours = hours;
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.toggle = function (hourId) {
            var idx = $scope.setting.hours.indexOf(hourId);
            if (idx == -1) {
                $scope.setting.hours.push(hourId);
            } else {
                $scope.setting.hours.splice(idx, 1);
            }
        };

        $scope.exists = function (hourId) {
            return $scope.setting.hours.indexOf(hourId) > -1;
        };

        $scope.saveSetting = function () {
            $scope.saving = true;
            saveSetting($scope.setting)
            .catch(function (reason) {
                $scope.errMsg = reason.data.message;
            })
            .finally(function () {
                $scope.saving = false;
            });
        };
    }

    $scope.editSettings = function (ev, setting) {
    };
});