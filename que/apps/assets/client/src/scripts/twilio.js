var twilioApp = angular.module('TwilioApp', []);

twilioApp
.controller('VideoCtrl', function ($scope, $stateParams, tokenService, appointmentService) {
    var vm = this;
    var token;
    var identity;
    var conversationClient;
    var activeConversation;
    var videoConsult;

    $scope.clientConnected = false;
    $scope.remoteParticipant = null;

    function getToken() {
        return tokenService.getToken(videoConsult.fullname)
                .then(function (data) {
                    token = data.token;
                    identity = data.identity;
                    return token;
                });
    }

    function activate() {
        return getToken().then(function (token) {
            var accessManager = new Twilio.AccessManager(token);
            conversationsClient = new Twilio.Conversations.Client(accessManager);
            conversationsClient.listen().then(function () {
                conversationsClient.on('invite', function (invite) {
                    invite.accept().then(conversationStarted);
                });
            }).catch(function (error) {
                console.log(error);
            });
        });
    }

    function conversationStarted(conversation) {
        activeConversation = conversation;
        if (!$scope.previewMedia) {
            $scope.$apply(function () {
                $scope.previewMedia = conversation.localMedia;
            });
        }

        conversation.on('participantConnected', function (participant) {
            $scope.$apply(function () {
                $scope.clientConnected = true;
                $scope.remoteParticipant = participant.media;
            });
        });

        conversation.on('participantDisconnected', function (participant) {
            $scope.$apply(function () {
                delete $scope.remoteParticipant;
            });
        });

        conversation.on('disconnected', function (conversation) {
            conversation.localMedia.stop();
            conversation.disconnect();
            activeConversation = null;
        });
    }

    $scope.previewCamera = function () {
        $scope.previewMedia = new Twilio.Conversations.LocalMedia();
        Twilio.Conversations.getUserMedia()
        .then(function (mediaStream) {
            $scope.$apply(function () {
                $scope.previewMedia.addStream(mediaStream);
            });
        }).catch(function (error) {
            console.log('Unable to access local media', error);
        });
    };

    $scope.call = function () {
        var options = {};
        $scope.previewCamera();

        if ($scope.previewMedia) {
            options.localMedia = $scope.previewMedia;
        }

        conversationsClient.inviteToConversation(videoConsult.physician, options)
        .then(conversationStarted, function (error) {
            console.log(error);
        });
    };

    appointmentService.getVideoConsult($stateParams.videoId)
    .then(function (response) {
        videoConsult = response;
        activate();
    });
})
.controller('PhysicianVideoCtrl', function ($scope, $stateParams, tokenService, physicianAppointmentService) {
    var token;
    var identity;
    var conversationClient;
    var activeConversation;
    var videoConsult;

    $scope.clientConnected = false;
    $scope.removeParticipant = null;

    function getToken() {
        return tokenService.getToken(videoConsult.physician)
                .then(function (data) {
                    token = data.token;
                    identity = data.identity;
                    return token;
                });
    }

    function activate() {
        return getToken().then(function (token) {
            var accessManager = new Twilio.AccessManager(token);
            conversationsClient = new Twilio.Conversations.Client(accessManager);
            conversationsClient.listen().then(function () {
                conversationsClient.on('invite', function (invite) {
                    invite.accept().then(conversationStarted);
                });
            }).catch(function (error) {
                console.log(error);
            });
        });
    }

    function conversationStarted(conversation) {
        activeConversation = conversation;
        if (!$scope.previewMedia) {
            $scope.$apply(function () {
                $scope.previewMedia = conversation.localMedia;
            });
        }

        conversation.on('participantConnected', function (participant) {
            $scope.$apply(function () {
                $scope.clientConnected = true;
                $scope.remoteParticipant = participant.media;
            });
        });

        conversation.on('participantDisconnected', function (participant) {
            $scope.$apply(function () {
                $scope.clientConnected = false
                delete $scope.remoteParticipant;
            });
        });

        conversation.on('disconnected', function (conversation) {
            conversation.localMedia.stop();
            conversation.disconnect();
            activeConversation = null;
            $scope.clientConnected = false;
        });
    }

    $scope.previewCamera = function () {
        $scope.previewMedia = new Twilio.Conversations.LocalMedia();
        Twilio.Conversations.getUserMedia()
        .then(function (mediaStream) {
            $scope.$apply(function () {
                $scope.previewMedia.addStream(mediaStream);
            });
        }).catch(function (error) {
            console.log('Unable to access local media', error);
        });
    };

    $scope.call = function () {
        var options = {};
        $scope.previewCamera();

        if ($scope.previewMedia) {
            options.localMedia = $scope.previewMedia;
        }

        conversationsClient.inviteToConversation(videoConsult.fullname, options)
        .then(conversationStarted, function (error) {
            console.log(error);
        });
    };

    physicianAppointmentService.getVideoConsult($stateParams.videoId)
    .then(function (response) {
        $scope.videoConsult = videoConsult = response;
        activate();
    }, function (reason) {
        console.log(reason);
    });
})
.directive('twilioVideo', function () {
    return {
        template: '<div class="twilio-video-media-container></div>',
        restrict: 'E',
        scope: {
            media: '='
        },
        link: function (scope, element, $attributes) {
            scope.$watch('media', function (newVal, oldVal) {
                if (scope.media) {
                    scope.media.attach(element[0]);
                }
            }, true);
        }
    }
})
.service('tokenService', function ($http) {
    var service = {
        getToken: function (fullname) {
            return $http.get('/twilio-token/'+fullname)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    };
    return service
})
.service('appointmentService', function ($http) {
    var service = {
        getVideoConsult: function (id) {
            return $http.get('/video-consults/' + id)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    }
    return service;
})
.service('physicianAppointmentService', function ($http) {
    var service = {
        getVideoConsult: function (id) {
            return $http.get('/video-consults/' + id)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    }
    return service;
})