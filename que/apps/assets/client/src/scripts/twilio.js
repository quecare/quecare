var twilioApp = angular.module('TwilioApp', []);

twilioApp
.controller('VideoCtrl', function ($scope, $stateParams, tokenService) {
    var vm = this;
    var token;
    var identity;
    var conversationClient;
    var activeConversation;

    $scope.clientConnected = false;
    $scope.removeParticipants = {};

    function getToken() {
        return tokenService.getToken()
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
                console.log('Could not connect to twilio');
            });
        });
    }

    function conversationStarted(conversation) {
        activeConversation = conversation;
        if (!scope.previewMedia) {
            $scope.$apply(function () {
                $scope.previewMedia = conversation.localMedia;
            });
        }

        conversation.on('participantConnected', function (participant) {
            $scope.$apply(function () {
                $scope.remoteParticipants[participant.sid] = participant.media;
            });
        });

        conversation.on('participantDisconnected', function (participant) {
            $scope.$apply(function () {
                delete $scope.remoteParticipants[participant.sid];
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
        Twilio.Conversations.getLocalMedia()
        .then(function (mediaStream) {
            $scope.$apply(function () {
                $scope.previewMedia.addStream(mediaStream);
            });
        }).catch(function (error) {
            console.log('Unable to access local media', error);
        });
    }
})
.directive('twilioVideo', function () {
    return {
        template: '<div class="twilio-video-media-container></div>',
        restrict: 'E',
        replace: true,
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
        getToken: function () {
            return $http.get('/twilio-token')
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                alert(error);
            });
        }
    };
    return service
})