queApp.controller('VideoCtrl', function ($scope, $stateParams) {
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
});
