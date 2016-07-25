queApp.controller('QuestionsCtrl', function ($scope, Questions, $state, $mdDialog) {
    var alert;
    $scope.askQuestion = function () {
        $scope.asking = true;
        Questions.post($scope.question)
        .then(function (response) {
             alert = $mdDialog.alert({
                title: 'Question sent',
                textContent: 'Your question has been sent. You would be notified when it has been answered.',
                ok: 'Close'
             });
             $mdDialog
             .show( alert )
             .finally(function() {
                alert = undefined;
                $state.go('home');
             });
        }, function (reason) {
            alert = $mdDialog.alert({
                title: 'Error',
                textContent: reason.data.message,
                ok: 'Close'
            });
            $mdDialog
            .show( alert )
            .finally(function () {
                alert = undefined;
            });
        }).finally(function () {
            $scope.asking = false;
        });
    };
})
