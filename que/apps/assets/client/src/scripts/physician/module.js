var quePhysicianApp = angular.module('QuePhysician', ['ngMaterial', 'ngMessages', 'ui.router', 'ngMdIcons',
                                                      'restangular', 'QueDirectives']);
quePhysicianApp.config(function ($interpolateProvider, $stateProvider, $urlRouterProvider, RestangularProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');

    function buildUrl(template) {
        return '/client/templates/physician/' + template + '.html';
    }

    $urlRouterProvider.otherwise('/questions');

    $stateProvider
        .state('data', {
            abstract: true,
            template: '<ui-view flex layout="row" layout-align="center start" layout-fill/>'
        })
        .state('data.questions', {
            url: '/questions',
            templateUrl: buildUrl('questions'),
            controller: 'QuestionsCtrl',
            resolve: {
                AllQuestions: function (Questions) {
                    return Questions.getList();
                }
            }
        })
        .state('data.videoConsults', {
            url: '/video-consults',
            templateUrl: buildUrl('video-consults'),
            controller: 'VideoConsultsCtrl',
            resolve: {
                AllVideoConsults: function (VideoConsults) {
                    return VideoConsults.getList();
                }
            }
        })
        .state('availabilitySettings', {
            url: '/availability-settings',
            templateUrl: buildUrl('availability-settings'),
            controller: 'AvailabilitySettingCtrl',
            data: {
                title: 'Availability Settings'
            },
            resolve: {
                AllHours: function (Hours) {
                    return Hours.getList();
                }
            }
        })
        .state('video', {
            url: '/video/:roomName',
            templateUrl: '/static/templates/video.html',
            controller: 'VideoCtrl'
        });

    RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
        if (data.data) {
            return data.data;
        } else {
            return data;
        }
    });
})
.filter('date', function () {
    return function (dateValue) {
        return moment(dateValue).fromNow();
    }
})
