var TwilioVideo = function(tokenUrl, localFeedView, remoteFeedView) {
    var self = this,
        accessToken = null,
        accessManager = null;

    this.localFeedView = localFeedView;
    this.remoteFeedView = remoteFeedView;
    this.conversationsClient = null;
    this.activeConversation = null;
    this.previewMedia = null;
    this.identity = null;
    this.remoteParticipantIdentity = null;
    this.remoteParticipant = null;
    this.incomingInvite = null;

    function checkSupport () {
        return navigator.webKitGetUserMedia && navigator.mozGetUserMedia;
    }

    function getAccessToken(cb) {
        return $.getJSON(tokenUrl).success(function(data) {
            self.identity = data.identity;
            accessToken = data.token;
            cb();
        }).fail(function (error) {
            console.log(error);
        });
    }

    this.clientConnected = function () {}

    function _clientConnected() {
        self.conversationsClient.on('invite', function(invite) {
            self.incomingInvite = invite;
        });

        self.conversationsClient.on('error', function (error) {
            console.log(error);
        });

        self.clientConnected();
    }

    function activate() {
        accessManager = new Twilio.AccessManager(accessToken);
        self.conversationsClient = new Twilio.Conversations.Client(accessManager);
        self.conversationsClient.listen().then(_clientConnected, function(error) {
            console.error('Could not connect to twilio: ' + error);
        });
    }

    this._conversationStarted = function(conversation) {
        self.activeConversation = conversation;
        self.conversationStarted && self.conversationStarted(conversation);

        if (!self.previewMedia) {
            self.previewMedia = conversation.localMedia;
            conversation.localMedia.attach(self.localFeedView);
        }

        conversation.on('participantConnected', function(participant) {
            self.remoteParticipant = participant;
            participant.media.attach(self.remoteFeedView);
        });

        conversation.on('participantDisconnected', function() {
            conversation.localMedia.stop();
            self.previewMedia = null;
            self.activeConversation = null;
            self.remoteParticipant = null;
        });

        conversation.on('participantFailed', function () {
            console.log('participant failed');
        });

        conversation.on('disconnected', function () {
            conversation.localMedia.stop();
            self.previewMedia = null;
            self.activeConversation = null;
            self.remoteParticipant = null;
        });

    };

    if (checkSupport()) {
        console.log('Browser not supported');
    } else {
        getAccessToken(function () {
            activate();
        });
    }
};

TwilioVideo.prototype = function () {
    var api = {};

    api.pickCall = function () {
        if (this.incomingInvite) {
            return this.incomingInvite.accept().then(this._conversationStarted);
        }
    };

    api.placeCall = function (identity) {
        this.remoteParticipantIdentity = identity ? identity : this.remoteParticipantIdentity;
        if (!this.activeConversation) {
            var options = {};
            if (this.previewMedia) {
                options.localMedia = this.previewMedia;
            }
            var outgoingCall = this.conversationsClient.inviteToConversation(this.remoteParticipantIdentity, options)
            outgoingCall.then(this._conversationStarted);
            return outgoingCall;
        }
    };

    api.cancelCall = function () {
        this.outgoingCall.cancel();
    };

    api.drop = function () {
        if (this.conversationsClient) {
            return this.activeConversation.disconnect();
        }
    };

    api.reject = function () {
        if (this.incomingInvite) {
            return this.incomingInvite.reject();
        }
    };

    api.mute = function () {
        if (this.previewMedia && !this.previewMedia.isMuted) {
            this.previewMedia.mute();
        } else if (this.previewMedia) {
            this.previewMedia.mute(false);
        }
        return this.previewMedia.isMuted;
    };

    api.pause = function () {
        if (this.previewMedia && !this.previewMedia.isPaused) {
            this.previewMedia.pause();
        } else if (this.previewMedia) {
            this.previewMedia.pause(false);
        }
        return this.previewMedia.isPaused;
    };

    api.previewCamera = function() {
        var self = this;

        if (!this.previewMedia) {
            this.previewMedia = new Twilio.Conversations.LocalMedia();
            Twilio.Conversations.getUserMedia()
            .then(function(mediaStream) {
                self.previewMedia.addStream(mediaStream);
                self.previewMedia.attach(self.localFeedView);
            }, function(error) {
                console.error('Unable to access local media', error);
            });
        }
    };

    api.stopPreviewCamera = function () {
        this.previewMedia.stop();
        this.previewMedia = null;
    };

    api.setRemoteParticipant = function(identity) {
        this.remoteParticipantIdentity = identity;
    };

    return api;
} ();