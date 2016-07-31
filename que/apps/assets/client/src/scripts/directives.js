var queDirectives = angular.module('QueDirectives', []);
queDirectives
.directive('savingToast', function () {
    return {
        restrict: 'E',
        template: '<div class="saving-toast">Saving...</div>'
    }
})
.directive('loading', function () {
    return {
        restrict: 'E',
        template: '<i class="fa fa-spinner fa-spin fa-2x"></i>'
    }
})
.directive('onEvent', function () {
    return {
        restrict: 'A',
        scope: {onEvent: '@', callback: '&'},
        link: function (scope, ele, attrs, ctrl) {
            ele.on(scope.onEvent, function () {
                scope.callback();
            })
        }
    }
})