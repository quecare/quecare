queApp.controller('QuestionsCtrl', function ($scope, Questions, Modals, $state) {
    var messageHeading, message;
    $scope.askQuestion = function () {
        Modals.loadingModal('Asking')
        .then(function (modal) {
            Questions.post($scope.question)
            .then(function () {
                messageHeading = 'Question sent';
                message = 'Question sent to physician. A link has been sent to your mail for further discussion';
            }, function (reason) {
                messageHeading = 'Error';
                message = reason.data.message;
            }).finally(function () {
                modal.scope.dismiss();
            });

            modal.closed.then(function () {
                var messageModal = Modals.messageModal(messageHeading, message);
                if (messageHeading == 'Question sent') {
                    messageModal.then(function (modal) {
                        modal.closed.then(function () {
                            $state.go('home');
                        });
                    });
                }
            });
        });
    };
})
