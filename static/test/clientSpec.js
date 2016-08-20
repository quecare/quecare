//describe("Que", function () {
//    var tester, $q, modals;
//
//    beforeEach(function () {
//        window.physician = {id: 1};
//        tester = ngMidwayTester('Que');
//        $q = tester.inject('$q');
//        modals = tester.inject('Modals');
//
//        var deferred = $q.defer();
//        spyOn(modals, 'loadingModal').and.returnValue(deferred.promise);
//        spyOn(modals, 'messageModal').and.returnValue(deferred.promise);
//        var modalDeferred = $q.defer();
//        deferred.resolve({closed: modalDeferred.promise, element: function (ev) {}});
//        modalDeferred.resolve();
//    });
//
//    afterEach(function() {
//        tester.destroy();
//        tester = null;
//    });
//
//    describe('ConsultationsCtrl', function () {
//        var scope, availabilityService, videoConsultsService, deferred;
//
//        beforeEach(function () {
//            scope = tester.rootScope().$new();
//            availabilityService = tester.inject('Availability');
//            videoConsultsService = tester.inject('VideoConsults');
//            tester.controller('ConsultationsCtrl', {$scope: scope, Availability: availabilityService,
//                                                    VideoConsults: videoConsultsService});
//            deferred = $q.defer();
//        });
//
//        afterEach(function () {
//            deferred = null;
//        });
//
//        describe('$scope.getAvailability', function () {
//            beforeEach(function () {
//                spyOn(availabilityService, 'getList').and.returnValue(deferred.promise);
//            });
//
//            it('should resolve', function () {
//                var serverResponse = [{'id': 1, 'day': 'monday', 'hours': [{'title': '09:00AM - 12:00PM', 'start_time': '',
//                                                                        'end_time': ''}], 'repeat_weekly': false}];
//                deferred.resolve(serverResponse);
//                scope.getAvailability();
//                scope.$apply();
//                expect(scope.availability).toBe(serverResponse);
//            });
//
//            it('should reject', function () {
//                var serverResponse = {'data': {'message': 'fail'}};
//                deferred.reject(serverResponse);
//                scope.getAvailability();
//                scope.$apply();
//                expect(scope.availabilityGetErr).toBe('fail');
//            });
//        });
//    });
//
//    describe('QuestionCtrl', function () {
//        var scope, questionService, deferred, $stateService;
//        beforeEach(function () {
//            scope = tester.rootScope().$new();
//            questionService = tester.inject('Questions');
//            $stateService = tester.inject('$state');
//
//            deferred = $q.defer();
//            tester.controller('QuestionsCtrl', {$scope: scope, Questions: questionService, Modals: modals,
//                                               $state: $stateService});
//        });
//
//        afterEach(function () {
//            deferred = null;
//        });
//
//        describe('$scope.askQuestion', function () {
//            beforeEach(function () {
//                spyOn(questionService, 'post').and.returnValue(deferred.promise);
//            });
//
//            it('should resolve', function () {
//                scope.question = {'fullname': 'dauda sheu', 'phone_number': '08091607291', 'email': 'test@domain.com',
//                                  'question': 'this is it'};
//                var serverResponse = angular.copy(scope.question);
//                serverResponse.id = 1;
//                deferred.resolve(serverResponse);
//                scope.askQuestion();
//                scope.$apply();
//                expect(tester.path()).toEqual('/');
//            });
//
//            it('should reject', function () {
//                var serverResponse = {data: {message: 'fail'}};
//                deferred.resolve(serverResponse);
//                scope.askQuestion();
//                scope.$apply();
//            });
//        });
//    });
//
//});
