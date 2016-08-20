(function () {
    var landingPage = $('.landing-page'),
        outgoingCall = $('.outgoing-call'),
        video = $('.video-container'),
        inCallControls = $('.in-call-controls'),
        incomingCall = $('.incoming-call');

    function changeUIState(state) {
        switch (state) {
            case 'outgoing-call':
                landingPage.addClass('hide');
                outgoingCall.removeClass('hide');
                break;
            case 'out-call-failed':
            case 'out-call-rejected':
            case 'out-call-canceled':
                outgoingCall.addClass('hide');
                landingPage.removeClass('hide');
                break;
            case 'call-accepted':
                outgoingCall.addClass('hide');
                incomingCall.addClass('hide');
                inCallControls.removeClass('hide');
                break;
            case 'call-dropped':
                inCallControls.addClass('hide');
                landingPage.removeClass('hide');
                break;
            case 'incoming-call':
                landingPage.addClass('hide');
                incomingCall.removeClass('hide');
                break;
            case 'incoming-call-rejected':
                incomingCall.addClass('hide');
                landingPage.removeClass('hide');
                break;
        }
    }

    var client = new TwilioVideo('/twilio-token/clientb', '#vid-local-feed', '#vid-remote-feed');
    client.setRemoteParticipant('clienta');
    client.conversationStarted = function conversationStarted (conversation) {
        conversation.on('participantConnected', function (participant) {
            changeUIState('call-accepted');
            participant.media.attach(client.remoteFeedView);
        });

        conversation.on('participantDisconnected', function () {
            changeUIState('call-dropped');
        });
    };

    client.clientConnected = function () {
        client.conversationsClient.on('invite', function (invite) {
            changeUIState('incoming-call');
        });
    };

    // action buttons
    $('#place-call').on('click', function () {
        changeUIState('outgoing-call');
        client.placeCall().catch(function (err) {
            if (err.name == 'CONVERSATION_INVITE_REJECTED') {
                changeUIState('out-call-rejected');
            } else if (err.name == 'CONVERSATION_INVITE_CANCELED') {
                changeUIState('out-call-canceled');
            } else if (err.name == 'CONVERSATION_INVITE_FAILED') {
                changeUIState('out-call-failed');
            }
            client.stopPreviewCamera();
        });
    });

    $('#cancel-call').on('click', function () {
        client.cancelCall();
    });

    $('#drop-call').on('click', function () {
        client.drop();
    });

    $('#mute').on('click', function () {
        client.mute();
        if (client.previewMedia.isMuted) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });

    $('#video').on('click', function () {
        client.pause();
        if (client.previewMedia.isPaused) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });

    $('#reject-call').on('click', function () {
        client.reject();
        changeUIState('incoming-call-rejected');
    });

    $('#pick-call').on('click', function () {
        client.pickCall();
    });
})();