describe("Que", function () {
    beforeEach(angular.mock.module('ngMaterial'));
    beforeEach(angular.mock.module('ngMessages'));
    beforeEach(angular.mock.module('ui.router'));
    beforeEach(angular.mock.module('ngMdIcons'));
    beforeEach(angular.mock.module('Que'));

    describe('MainCtrl', function () {
        var $controller, $rootScope, $state;

        beforeEach(inject(function (_$controller_, _$rootScope_, _$state_) {
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $state = _$state_;
        }));

        describe('$scope.pageTitle', function () {
            var $scope, controller;

            beforeEach(function () {
                $scope = {};
                controller = $controller('MainCtrl', { $scope: $scope, $rootScope: $rootScope, $state: $state});
            });

            it('sets the pageTitle to "current state data title" if title is found in toState.data.title',
            function () {
                var toState = {data: {title: 'Your Question'}},
                    fromState = {name: ""};
                $rootScope.$emit('$stateChangeSuccess', toState, undefined, fromState, undefined, undefined);
                expect($scope.pageTitle).toEqual(toState.data.title);
            });

            it('sets the pageTitle to "Menu" if data title is not found',
            function () {
                var toState = {},
                    fromState = {name: ""};
                $rootScope.$emit('$stateChangeSuccess', toState, undefined, fromState, undefined, undefined);
                expect($scope.pageTitle).toEqual("Menu");
            });
        });
    });

    describe('QuestionsCtrl', function () {
        var $controller, $questionService, httpBackend;

        beforeEach(inject(function (_$controller_, _Questions_, $httpBackend) {
            $controller = _$controller_;
            $questionService = _Questions_;
            httpBackend = $httpBackend;
        }));

        describe('$scope.askQuestion', function () {
            var $scope, controller;

            beforeEach(function () {
                $scope = {};
                $scope.question = {id: 'question-id', email: 'email@company.com', fullname: 'Joshua Ogunjobi',
                                phone_number: '08092567971', question: 'This is the question'}
                controller = $controller('QuestionsCtrl', {$scope: $scope, Questions: $questionService})
            });

            it('test posting question', function () {
                respond_data = $scope.question;
                respond_data.date_asked  = '2016-07-14 14:00:00';
                respond_data.date_last_updated = '2016-07-14 14:00:00';
                httpBackend.whenPOST('/questions').respond(respond_data);
                $scope.askQuestion();
            });
        });
    });

    describe('ConsultationsCtrl', function () {
        var $controller;

        beforeEach(inject(function (_$controller_) {
            $controller = _$controller_;
        }));
    });
});
