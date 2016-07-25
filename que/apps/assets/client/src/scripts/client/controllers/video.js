queApp.controller('VideoCtrl', function ($scope, $stateParams) {
    var AppearIn = window.AppearIn;
    var appearin = new AppearIn();

    var iframe = document.getElementById("video");
    appearin.addRoomToIframe(iframe, $stateParams.roomName);
});
