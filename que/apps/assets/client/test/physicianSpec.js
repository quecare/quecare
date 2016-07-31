describe("Que", function () {
    var tester, $q;

    beforeEach(function () {
        window.physician = {id: 1};
        tester = ngMidwayTester('QuePhysician');
        $q = tester.inject('$q');
    });

    afterEach(function() {
        tester.destroy();
        tester = null;
    });

    describe('AvailabilitySettingCtrl', function () {
        var $scope, availabilitySettingsService, hoursService;

        beforeEach(function () {
            $scope = tester.rootScope().$new();
            availabilitySettingsService = tester.inject('AvailabilitySettings');
            hoursService = tester.inject('Hours');
            tester.controller('AvailabilitySettingCtrl', {$scope: $scope, Hours: hoursService,
                                                          AvailabilitySettings: availabilitySettingsService});
        });

        it('$scope.getHours should pass', function () {
            var deferred = $q.defer();
            var allHours = [{'start_time': '9:00AM', 'id': '5789995b87e065340ed2a27f', 'end_time': '12:00PM',
                             'title': '9:00AM - 12:00PM'}, {'start_time': '12:00PM', 'id': '5789995b87e065340ed2a280',
                             'end_time': '3:00PM', 'title': '12:00PM - 3:00PM'}, {'start_time': '3:00PM',
                             'id': '5789995b87e065340ed2a281', 'end_time': '6:00PM', 'title': '3:00PM - 6:00PM'},
                            {'start_time': '6:00PM', 'id': '5789995b87e065340ed2a282', 'end_time': '9:00PM',
                             'title': '6:00PM - 9:00PM'}, {'start_time': '9:00PM', 'id': '5789995b87e065340ed2a283',
                             'end_time': '11:00PM', 'title': '9:00PM - 11:00PM'}];
            spyOn(hoursService, 'getList').and.returnValue(deferred.promise);
            deferred.resolve(allHours);
            $scope.getHours();
            $scope.$apply();
            expect($scope.hours).toBe(allHours);
        });

        it('$scope.getAvailabilitySettings should pass', function () {
            var deferred = $q.defer();
            var settings = [{'day': 'monday', 'hours': [], 'repeat_weekly': false},
                            {'day': 'tuesday', 'hours': [], 'repeat_weekly': false},
                            {'day': 'wednesday', 'hours': [], 'repeat_weekly': false},
                            {'day': 'thursday', 'hours': [], 'repeat_weekly': false},
                            {'day': 'friday', 'hours': [], 'repeat_weekly': false},
                            {'day': 'saturday', 'hours': [], 'repeat_weekly': false},
                            {'day': 'sunday', 'hours': [], 'repeat_weekly': false}]
            spyOn(availabilitySettingsService, 'getList').and.returnValue(deferred.promise);
            deferred.resolve(settings);
            $scope.getAvailabilitySettings();
            $scope.$apply();
            expect($scope.availabilitySettings).toBe(settings);
        });

        describe('$scope.saveSetting', function () {
            var deferred, setting, updatedSetting;

            beforeEach(function () {
                deferred = $q.defer();
                setting = {'day': 'monday', 'hours': [], 'put': function () { return deferred.promise }};
                updatedSetting = angular.copy(setting);
            });

            it('should pass', function () {
                updatedSetting.hours.push(1)
                deferred.resolve(updatedSetting);
                $scope.saveSetting(setting);
                $scope.$apply();
                expect(setting.hours).toContain(1);
            });

            it('should fail', function () {
                updatedSetting.hours.push(1)
                deferred.reject({data: {message: 'Fail'}});
                $scope.saveSetting(setting);
                $scope.$apply();
                expect($scope.saveSettingError).toEqual('Fail');
            });

        })

        it('$scope.exists', function () {
            var ifExists = $scope.exists({'hours': []}, 1);
            expect(ifExists).toBe(false);
            var ifExists = $scope.exists({'hours': [1]}, 1);
            expect(ifExists).toBe(true);
        });

        it('$scope.toggleHour', function () {
            var deferred = $q.defer();
            var setting = {'day': 'monday', 'hours': [], 'put': function () { return deferred.promise }};
            deferred.resolve(setting);
            $scope.toggleHour(setting, 1);
            expect(setting.hours).toContain(1);
            $scope.toggleHour(setting, 1);
            expect(setting.hours).not.toContain(1);
        });

        it('$scope.toggleRepeatWeekly', function () {
            var deferred = $q.defer();
            var setting = {'day': 'monday', 'hours': [], 'put': function () { return deferred.promise },
                           'repeat_weekly': false};
            deferred.resolve(setting);
            $scope.toggleRepeatWeekly(setting);
            expect(setting.repeat_weekly, true);
            $scope.toggleRepeatWeekly(setting);
            expect(setting.repeat_weekly, false);
        });

    });
});