queApp.controller('DiscussionCtrl', function ($scope, Restangular, Physician, Answers, $state, $stateParams, Modals) {
    $scope.answer = {};

    $scope.getQuestion = function () {
        $scope.gettingQuestion = true;
        Restangular.one('discussions', $stateParams.discussionId).get()
        .then(function (response) {
            $scope.question = response;
        }, function (reason) {
            $scope.getQuestionErr = reason.data.message;
        }).finally(function () {
            $scope.gettingQuestion = false;
        });
    };

    $scope.sendAnswer = function () {
        var heading, message;
        Modals.loadingModal('Saving')
        .then(function (modal) {
            Restangular.one('discussions', $stateParams.discussionId).post('answers', $scope.answer)
            .then(function (response) {
                $scope.question.answers.unshift(response);
                heading = 'Saved';
                message = 'Answer saved';
            }, function (reason) {
                heading = 'Error';
                message = reason.data.message;
            }).finally(function () {
                modal.scope.dismiss();
            });

            modal.closed.then(function () {
                Modals.messageModal(heading, message);
            })
        });
    };

    $scope.getQuestion();
})
