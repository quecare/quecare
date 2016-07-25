quePhysicianApp.controller('MainCtrl', function ($scope, $rootScope, $mdSidenav) {
    var defaultTitle = 'Dr .O. Obasan';
    var dataPageLinks = [{'title': 'questions', 'stateName': 'data.questions'},
                {'title': 'video consults', 'stateName': 'data.videoConsults'}];

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        $scope.pageTitle = (toState.data && toState.data.title) || defaultTitle;
        var pageName = toState.name.split('.');
        if (pageName[0] == 'data') {
            $scope.pages = dataPageLinks;
        } else {
            $scope.pages = undefined;
        }
    });

    $scope.toggleSideNav = function () {
        $mdSidenav('left').toggle();
    };
});