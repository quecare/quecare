describe("Que", function () {
    beforeEach(angular.mock.module('ngMaterial'));
    beforeEach(angular.mock.module('ngMessages'));
    beforeEach(angular.mock.module('ui.router'));
    beforeEach(angular.mock.module('ngMdIcons'));
    beforeEach(angular.mock.module('restangular'));
    beforeEach(angular.mock.module('QueDirectives'));
    beforeEach(angular.mock.module('QuePhysician'));

    var httpBackend;

    beforeEach(inject(function ($httpBackend) {
        httpBackend = $httpBackend;
        httpBackend.whenGET('/static/templates/physician/questions.html').respond(200, '<html>');
        httpBackend.whenGET('/questions')
        .respond(200, []);
    }));

    describe('AvailabilitySettingCtrl', function () {
        var $controller, availabilitySettingsService, allHours;

        beforeEach(inject(function (_$controller_, _AvailabilitySettings_, $httpBackend) {
            $controller = _$controller_;
            availabilitySettingsService = _AvailabilitySettings_;
            allHours = [{'start_time': '9:00AM', 'id': '5789995b87e065340ed2a27f', 'end_time': '12:00PM',
                         'title': '9:00AM - 12:00PM'}, {'start_time': '12:00PM', 'id': '5789995b87e065340ed2a280',
                         'end_time': '3:00PM', 'title': '12:00PM - 3:00PM'}, {'start_time': '3:00PM',
                         'id': '5789995b87e065340ed2a281', 'end_time': '6:00PM', 'title': '3:00PM - 6:00PM'},
                        {'start_time': '6:00PM', 'id': '5789995b87e065340ed2a282', 'end_time': '9:00PM',
                         'title': '6:00PM - 9:00PM'}, {'start_time': '9:00PM', 'id': '5789995b87e065340ed2a283',
                         'end_time': '11:00PM', 'title': '9:00PM - 11:00PM'}];
        }));

        describe('$scope.availabilitySettings with empty data from server', function () {
            var $scope, controller;
            beforeEach(function () {
                $scope = {};
                httpBackend.whenGET('/availability-settings').respond(200, []);
                controller = $controller('AvailabilitySettingCtrl', {$scope: $scope, AllHours: allHours,
                                                                    AvailabilitySettings: availabilitySettingsService});
            });

            it('sets up $scope.availabilitySettings with missing days', function () {
                httpBackend.flush();
                expect($scope.availabilitySettings.$object.length).toEqual(7);
            });
        });

        describe('$scope.availabilitySettings with some setup days from server', function () {
            var $scope, controller;

            beforeEach(function () {
                $scope = {};

                controller = $controller('AvailabilitySettingCtrl', {$scope: $scope, AllHours: allHours,
                                                                    AvailabilitySettings: availabilitySettingsService});
                httpBackend.whenGET('/availability-settings')
                .respond(200, [{'day': 'monday', 'hours': ['5789995b87e065340ed2a282'], 'repeat_weekly': true,
                        'id': '5789995b87e065340ed2a285'}])
            });


            it('sets up $scope.availabilitySettings with remaining days', function () {
                httpBackend.flush();
                expect($scope.availabilitySettings.$object.length).toEqual(7);
                expect($scope.availabilitySettings.$object[0].id).toEqual('5789995b87e065340ed2a285');
            });
        })

        describe('$scope.saveSettings', function () {
            var $scope, controller;
            beforeEach(function () {
                $scope = {};
                controller = $controller('AvailabilitySettingCtrl', {$scope: $scope, AllHours: allHours,
                                                                    AvailabilitySettings: availabilitySettingsService});
                httpBackend.whenGET('/availability-settings').respond(200, []);
                httpBackend.whenPOST('/availability-settings')
                .respond(200, {'day': 'monday', 'id': '5789995b87e065340ed2a285', 'hours': ['5789995b87e065340ed2a282',
                               '5789995b87e065340ed2a282', '5789995b87e065340ed2a281'], 'repeat_weekly': false,
                               'date_added': new Date(), 'date_last_modified': new Date()});
            });

            it('saves setting', function () {
                var setting = _.extend($scope.availabilitySettings.$object[0], {'day': 'monday',
                              'hours': ['5789995b87e065340ed2a282', '5789995b87e065340ed2a282',
                              '5789995b87e065340ed2a281'], 'repeat_weekly': false});
                $scope.saveSetting(setting);
                httpBackend.flush();
                expect(setting.id).toEqual('5789995b87e065340ed2a285');
                expect(setting.date_added).not.toBe(undefined);
                expect(setting.date_last_modified).not.toBe(undefined);
            });
        });
    });

    describe('QuestionsCtrl', function () {
        var $scope, $controller;

        beforeEach(inject(function (_$controller_, _Questions_) {
            $scope = {};
            questions = [{'id': 'question-id', 'email': 'jideobs@gmail.com', 'fullname': 'Olajide Obasan',
                          'phone_number': '08091607291', 'question': 'I have stomach ache',
                          'date_asked': new Date(), 'date_last_updated': new Date()},
                          {'id': 'question-id', 'email': 'jideobs@gmail.com', 'fullname': 'Olajide Obasan',
                          'phone_number': '08091607291', 'question': 'I have back pain',
                          'date_asked': new Date(), 'date_last_updated': new Date()}];

            $controller = _$controller_('QuestionsCtrl', {$scope: $scope, AllQuestions: questions,
                                                         Questions: _Questions_});
        }));

        it('expects $scope.questions to be length 2', function () {
            expect($scope.questions.length).toBe(2);
        });
    });

    describe('AnswersCtrl', function () {
        var $scope, $controller;

        beforeEach(inject(function (_$controller_, _Answers_) {
            $scope = {questions: [{'id': 1, 'email': 'jideobs@gmail.com', 'fullname': 'Olajide Obasan',
                      'phone_number': '08091607291', 'question': 'I have stomach ache',
                      'date_asked': new Date(), 'date_last_updated': new Date()},
                      {'id': 2, 'email': 'jideobs@gmail.com', 'fullname': 'Olajide Obasan',
                       'phone_number': '08091607291', 'question': 'I have back pain',
                       'date_asked': new Date(), 'date_last_updated': new Date()}]};
            $controller = _$controller_('AnswersCtrl', {$scope: $scope, $stateParams: {'id': 2},
                                                        Answers: _Answers_});
            httpBackend.whenGET('/questions/2/answers')
            .respond(200, []);

            httpBackend.whenPOST('/questions/2/answers')
            .respond(200, {'id': 3, 'question': 2, 'answer': 'this is the answer',
                           'date_answered': new Date(), 'date_last_modified': new Date()})
        }));

        describe('$scope.question', function () {
            it('length should be 1', function () {
                expect($scope.question).toEqual($scope.questions[1]);
            });
        });

        describe('$scope.addAnswer', function () {
            it('post answer', function () {
                $scope.answer = {'answer': 'this is the answer'};
                $scope.addAnswer();
                httpBackend.flush();
                expect($scope.answers.$object.length).toBe(1);
                expect($scope.answers.$object[0].id).toEqual(3);
            });
        });
    });

    describe('VideoConsultsCtrl', function () {
        var $scope, $controller;

        beforeEach(inject(function (_$controller_, _VideoConsults_) {
            $scope = {};
            var startTime = new Date();
            startTime.setHours(9);
            startTime.setMinutes(0);
            startTime.setSeconds(0);
            var endTime = new Date();
            startTime
            allVideoConsults = [{'id': 1, 'fullname': 'Olajide Obasan', 'email': 'jideobs@gmail.com',
                                 'appointment': 3, 'hour': {'title': '9:00AM - 12:00PM', 'start_time': startTime,
                                 'end_time': new Date()}, 'date_chosen': new Date(), 'date_last_modified': new Date()}]
            $controller = _$controller_('VideoConsultsCtrl', {$scope: $scope, VideoConsults: _VideoConsults_})
        }));
    });
});