var queApp = angular.module('Que', ['ngMaterial', 'ngMessages', 'ui.router', 'ngMdIcons', 'restangular']);

queApp.config(function ($interpolateProvider, $stateProvider, $urlRouterProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');

    function buildUrl(template) {
        return '/static/templates/' + template + '.html';
    }

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: buildUrl('home')
        })
        .state('questions', {
            url: '/questions/ask',
            templateUrl: buildUrl('questions'),
            controller: 'QuestionsCtrl',
            data: {
                title: 'Your Question'
            }
        })
        .state('consultations', {
            url: '/consultations',
            templateUrl: buildUrl('consultations'),
            controller: 'ConsultationsCtrl',
            data: {
                title: 'New Consultation'
            },
            resolve: {
                TodayTimes: function (Restangular) {
                    return Restangular.one('availability').get();
                }
            }
        })
        .state('video', {
            url: '/video/:roomName',
            templateUrl: buildUrl('video'),
            controller: 'VideoCtrl'
        })
})
.filter('date', function () {
    return function (dateString) {
        return moment(dateString).fromNow();
    }
})
