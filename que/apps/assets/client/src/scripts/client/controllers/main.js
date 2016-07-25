queApp.controller('MainCtrl', function ($rootScope, $state, $scope) {
    var prevStates = [];

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, options) {
        var pageTitle = toState.data && toState.data.title;
        if (pageTitle) {
            $scope.pageTitle = toState.data.title;
        } else {
            $scope.pageTitle = 'Menu';
        }

        if (fromState.name != "") {
            prevStates.push(fromState.name);
        }
    });

    $scope.goBack = function () {
        var prevState = prevStates.pop() || 'home';
        $state.go(prevState);
    };
});
