quePhysicianApp.controller('DiscussionsCtrl', function ($scope, Questions, Answers, $state, Modals) {
    var answers;
    $scope.getQuestions = function () {
        $scope.gettingQuestions = true;
        Questions.getList().then(function (response) {
            $scope.questions = response;
        }, function (reason) {
            $scope.questionsGetErr = reason.data.message;
        }).finally(function () {
            $scope.gettingQuestions = false;
        });
    };

    $scope.viewQuestion = function (question) {
        if (!question.read) {
            question.put()
            .then(function (response) {
                _.extend(question, response);
            });
        }

        $scope.answer = {};
        $scope.selectedQuestion = question;
        $state.go('discussions.discussion');
        answers = Answers($scope.selectedQuestion.id);
        $scope.gettingAnswers = true;
        answers.getList()
        .then(function (response) {
            $scope.answers = response;
        }, function (reason) {
            $scope.getAnswersErr = reason.data.message;
        }).finally(function () {
            $scope.gettingAnswers = false;
        });
    };

    $scope.answerQuestion = function () {
        var heading, message;
        Modals.loadingModal('Answering').then(function (modal) {
            answers.post($scope.answer)
            .then(function (response) {
                $scope.answers.unshift(response);
                heading = 'Saved';
                message = 'Response saved successfully';
            }, function (reason) {
                heading = 'Error';
                message = reason.data.message;
            }).finally(function () {
                modal.scope.dismiss();
                $scope.answer = {};
            });

            modal.closed.then(function () {
                Modals.messageModal(heading, message);
            });
        });
    };

    $scope.getQuestions();
});