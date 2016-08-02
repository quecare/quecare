globalServices = angular.module('globalServices', ['angularModalService']);
globalServices
.factory('LoadingModal', function (ModalService) {
    return function (loadingInfo) {
        var loadingInfo = loadingInfo || 'Loading';
        var modal = ModalService.showModal({
            templateUrl: '/client/templates/partials/loading-modal.html',
            inputs: {loadingInfo: loadingInfo},
            controller: function ($scope, $element, close, loadingInfo) {
                $scope.loadingInfo = loadingInfo;
                $scope.dismiss = function () {
                    $element.modal('hide');
                    close(null, 500);
                };
            }
        }).then(function (modal) {
            modal.element.modal({backdrop: 'static'});
            return modal
        });
        return modal;
    }
})
.factory('MessageModal', function (ModalService) {
    return function (modalHeading, modalMessage) {
        var modal = ModalService.showModal({
            templateUrl: '/client/templates/partials/message-modal.html',
            inputs: {heading: modalHeading, message: modalMessage},
            controller: function ($scope, $element, close, heading, message) {
                $scope.heading = heading;
                $scope.message = message;
                $scope.dismiss = function () {
                    $element.modal('hide');
                    close(null, 500);
                };
            }
        }).then(function (modal) {
            modal.element.modal({backdrop: 'static'});
            return modal;
        });
        return modal;
    };
})
.factory('Modals', function (LoadingModal, MessageModal) {
    return {loadingModal: LoadingModal, messageModal: MessageModal};
})
.factory('socket', function ($rootScope) {
    return {
        on: function (eventName, callback) {
            $rootScope.socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply($rootScope.socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            $rootScope.socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply($rootScope.socket, args);
                    }
                });
            })
        }
    };
})
.factory('RefreshAuthToken', function ($http, Restangular) {
    var lastAuthToken, lastTimeRefreshed;
    function refreshAuthToken (reqResponse, responseHandler, deferred) {
        return $http.get('get-auth-token').then(function (authResponse) {
            lastTimeRefreshed = new Date();
            lastAuthToken = reqResponse.config.headers['auth-token'] = authResponse.data.token;
            $http(reqResponse.config).then(responseHandler, deferred.reject);
        });
    }

    function isTokenValid() {
        if (!lastAuthToken) {
            return false;
        }

        var currentTime = new Date();
        var timeDifference = Math.abs(currentTime.getHours() - lastTimeRefreshed.getHours()) / 36e5;
        return timeDifference < 1;
    }

    function setup() {
        Restangular.addFullRequestInterceptor(
        function (element, operation, what, url, headers, params, httpConfig) {
            if (isTokenValid()) {
                headers['auth-token'] = lastAuthToken;
            }
            return {
                element: element,
                headers: headers,
                params: params,
                httpConfig: httpConfig
            }
        });

        Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
            if(response.status === 403) {
                if (isTokenValid()) {
                    response.config.headers['auth-token'] = lastAuthToken;
                    $http(response.config).then(responseHandler, deferred.reject);
                } else {
                    refreshAuthToken(response, responseHandler, deferred);
                }
                return false;
            }
            return true;
        });
    }

    return {setup: setup};
})