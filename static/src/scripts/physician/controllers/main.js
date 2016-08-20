quePhysicianApp.controller('MainCtrl', function ($scope, Physician, ModalService) {
    $scope.current_user = Physician;

    var outgoingCallModal = ModalService.showModal({
        templateUrl: 'outgoing-call-modal.html',
        controller: outgoingCallCtrl
    });

    function incomingCallCtrl ($scope, invite, $element, close) {
        $scope.invite = invite;
        $scope.pickCall = function () {
            client.pickCall()
            .then(function () {
                $element.modal('hide');
                close(null, 500);
            });
        };

        $scope.rejectCall = function () {
            client.reject();
        };
    }

    function outgoingCallCtrl ($scope, $element, close) {
        $scope.cancelCall = function () {
            client.cancelCall();
            $element.modal('hide');
            close(null, 500);
        };
    }

    var client = new TwilioVideo('/twilio-token/clienta', '#vid-local-feed', '#vid-remote-feed');

    client.conversationStarted = function conversationStarted (conversation) {

        conversation.on('participantConnected', function () {
            $('#video-call-modal').modal('show');
        });

        conversation.on('participantDisconnected', function () {
            $('#video-call-modal').modal('hide');
        });
    };

    client.clientConnected = function clientConnected () {
        client.conversationsClient.on('invite', function (invite) {
            ModalService.showModal({
                templateUrl: 'incoming-call-modal.html',
                controller: incomingCallCtrl,
                inputs: {invite: invite}
            }).then(function (modal) {
                modal.element.modal({backdrop: 'static'});
            });
        });

        $scope.placeCall = function (participantIdentity) {

            outgoingCallModal.then(function (modal) {
                modal.element.modal({backdrop: 'static'});

                client.placeCall(participantIdentity)
                .then(function () {
                    modal.element.modal('hide');
                },function (err) {
                    modal.element.modal('hide');
                    if (err.name == 'CONVERSATION_INVITE_REJECTED') {
                        alert('Call rejected');
                    } else if (err.name == 'CONVERSATION_INVITE_CANCELED') {
                        alert('Call canceled');
                    } else if (err.name == 'CONVERSATION_INVITE_FAILED') {
                        alert('Call failed');
                    }
                });
            });
        };
    };

    $scope.dropCall = function () {
        client.drop();
    };

    $scope.toggleAudio = function () {
        $scope.isMuted = client.mute();
    };

    $scope.toggleVideo = function () {
        $scope.isPaused = client.pause();
    };
});