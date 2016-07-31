var quePhysicianApp = angular.module('QuePhysician', ['ngMessages', 'ui.router', 'restangular', 'QueDirectives']);


quePhysicianApp.config(function ($provide, $interpolateProvider, $stateProvider, $urlRouterProvider, RestangularProvider) {
    var physician = angular.copy(window.physician);
    $provide.constant('Physician', physician);

    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');

    function buildUrl(template) {
        return '/client/templates/physician/' + template + '.html';
    }

    $urlRouterProvider.otherwise('/discussions');

    $stateProvider
        .state('discussions', {
            url: '/discussions',
            templateUrl: buildUrl('discussions'),
            controller: 'DiscussionCtrl',
        })
        .state('videoConsults', {
            url: '/video-consults',
            templateUrl: buildUrl('video-consults'),
            controller: 'VideoConsultsCtrl',
        })
        .state('availabilitySettings', {
            url: '/availability-settings',
            templateUrl: buildUrl('availability-settings'),
            controller: 'AvailabilitySettingCtrl',
            data: {
                title: 'Availability Settings'
            },
        })
        .state('settings', {
            url: '/settings',
            templateUrl: buildUrl('settings'),
            controller: 'SettingsCtrl'
        })
        .state('settings.profile', {
            url: '/profile',
            templateUrl: buildUrl('profile'),
            controller: 'ProfileCtrl'
        })
        .state('settings.password', {
            url: '/password',
            templateUrl: buildUrl('password'),
            controller: 'PasswordCtrl'
        })
        .state('video', {
            url: '/video/:roomName',
            templateUrl: '/static/templates/video.html',
            controller: 'VideoCtrl'
        });

    var tokenEle = document.getElementById('_tA')
    RestangularProvider.setDefaultHeaders({'auth-token': tokenEle && tokenEle.innerHTML});
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
