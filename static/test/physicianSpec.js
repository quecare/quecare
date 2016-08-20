describe("Que", function () {
    var tester, $q, modals;

    beforeEach(function () {
        window.physician = {id: 1};
        tester = ngMidwayTester('QuePhysician');
        $q = tester.inject('$q');
        modals = tester.inject('Modals');

        var deferred = $q.defer();
        spyOn(modals, 'loadingModal').and.returnValue(deferred.promise);
        spyOn(modals, 'messageModal').and.returnValue(deferred.promise);
        var modalDeferred = $q.defer();
        deferred.resolve({closed: modalDeferred.promise, element: function (ev) {}});
        modalDeferred.resolve();
    });

    afterEach(function() {
        tester.destroy();
        tester = null;
    });

    describe('AvailabilitySettingCtrl', function () {
        var $scope, availabilitySettingsService, availabilityTimesService;

        beforeEach(function () {
            $scope = tester.rootScope().$new();
            availabilitySettingsService = tester.inject('AvailabilitySettings');
            availabilityTimesService = tester.inject('AvailabilityTimes');
            tester.controller('AvailabilitySettingCtrl', {$scope: $scope, AvailabilityTimes: availabilityTimesService,
                                                          AvailabilitySettings: availabilitySettingsService});
        });

        it('$scope.getAvailabilityTimes should pass', function () {
            var deferred = $q.defer();
            var allAvailabilityTimes = [{'start_time': '9:00AM', 'id': '5789995b87e065340ed2a27f', 'end_time': '12:00PM',
                             'title': '9:00AM - 12:00PM'}, {'start_time': '12:00PM', 'id': '5789995b87e065340ed2a280',
                             'end_time': '3:00PM', 'title': '12:00PM - 3:00PM'}, {'start_time': '3:00PM',
                             'id': '5789995b87e065340ed2a281', 'end_time': '6:00PM', 'title': '3:00PM - 6:00PM'},
                            {'start_time': '6:00PM', 'id': '5789995b87e065340ed2a282', 'end_time': '9:00PM',
                             'title': '6:00PM - 9:00PM'}, {'start_time': '9:00PM', 'id': '5789995b87e065340ed2a283',
                             'end_time': '11:00PM', 'title': '9:00PM - 11:00PM'}];
            spyOn(availabilityTimesService, 'getList').and.returnValue(deferred.promise);
            deferred.resolve(allAvailabilityTimes);
            $scope.getAvailabilityTimes();
            $scope.$apply();
            expect($scope.availabilityTimes).toBe(allAvailabilityTimes);
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
                setting = {'day': 'monday', 'availability_times': [], 'put': function () { return deferred.promise }};
                updatedSetting = angular.copy(setting);
                var availabilityTime = {end_time: "Tue, 16 Aug 2016 20:08:54 -0000", id :"57b3904187e065305a73bfce",
                                         start_time: "Tue, 16 Aug 2016 09:08:00 -0000", title :"9:00AM - 9:15AM"}
                updatedSetting.availability_times.push(availabilityTime)
            });

            it('should pass', function () {
                deferred.resolve(updatedSetting);
                $scope.saveSetting(setting);
                $scope.$apply();
                expect(setting.availability_times[0]).toBe();
            });

            it('should fail', function () {
                deferred.reject({data: {message: 'Fail'}});
                $scope.saveSetting(setting);
                $scope.$apply();
                expect($scope.saveSettingError).toEqual('Fail');
            });

        })

        it('$scope.exists', function () {
            var ifExists = $scope.exists({availability_times: [{title: "9:00AM - 9:15AM"}]}, '00:00AM - 00:15AM');
            expect(ifExists).toBe(false);
            var ifExists = $scope.exists({availability_times: [{title: "9:00AM - 9:15AM"}]}, '9:00AM - 9:15AM');
            expect(ifExists).toBe(true);
        });

        it('$scope.toggleHour', function () {
            var deferred = $q.defer();
            var setting = {'day': 'monday', 'availability_times': [], 'put': function () { return deferred.promise }};
            deferred.resolve(setting);
            $scope.toggleHour(setting, {availability_times: [{title: "9:00AM - 9:15AM"}]});
            expect(setting.availability_times.length).toBe(1);
            $scope.toggleHour(setting, {availability_times: [{title: "9:00AM - 9:15AM"}]});
            expect(setting.availability_times).not.toContain(1);
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

    describe('ProfileCtrl', function () {
        var $scope, physicianService;

        beforeEach(function () {
            $scope = tester.rootScope().$new();
            physicianService = tester.inject('Physicians');
            tester.controller('ProfileCtrl', {$scope: $scope, Physicians: physicianService});
            expect($scope.physician.id).toBe(1);
        });

        describe('$scope.saveProfile', function () {
            var deferred;

            beforeEach(function () {
                deferred = $q.defer();
                spyOn(physicianService, 'put').and.returnValue(deferred.promise);
            });

            it('should be successful', function () {
                $scope.physician.fullname = 'Olajide Obasan';
                var dataFromServer = angular.copy($scope.physician);
                dataFromServer.fromServer = true;
                deferred.resolve(dataFromServer);
                $scope.saveProfile();
                $scope.$apply();
                expect($scope.physician.fromServer).toBe(true);
            });

            it('should fail', function () {
                $scope.physician.bio = 'This is the goddamn bio';
                deferred.reject({data: {message: 'Fail'}});
                $scope.saveProfile();
                $scope.$apply();
                expect($scope.saveProfileErr).toBe('Fail');
            });
        });
    });
});