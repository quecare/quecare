var queApp = angular.module('Que', ['ngMessages', 'ui.router', 'restangular', 'globalServices', 'QueDirectives']);

queApp.config(function ($provide, $interpolateProvider, $stateProvider, $urlRouterProvider) {
    var physician = angular.copy(window.physician);
    $provide.constant('Physician', physician);

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
        .state('discussion', {
            url: '/discussion/:discussionId',
            templateUrl: buildUrl('discussion'),
            controller: 'DiscussionCtrl'
        })
        .state('consultations', {
            url: '/consultations',
            templateUrl: buildUrl('consultations'),
            controller: 'ConsultationsCtrl',
            data: {
                title: 'New Consultation'
            }
        })
        .state('video', {
            url: '/video/:videoId',
            templateUrl: buildUrl('video'),
            controller: 'VideoCtrl'
        })
})
.filter('date', function () {
    return function (dateString) {
        return moment(dateString).startOf('hour').fromNow();
    }
})
.filter('calendar', function () {
    return function (dateString) {
        return moment(dateString).calendar();
    }
})
.filter('formatTime', function () {
    return function (dateString) {
        return moment(dateString).format('MMMM Do YYYY');
    };
});
