quePhysicianApp.controller('DiscussionCtrl', function ($scope, Questions, Answers) {

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

    function DialogCtrl ($scope, discussion) {
        $scope.question = question;
        var answer = Answers($scope.question.id);
        $scope.answers = answer.getList();


        $scope.answerQuestion = function () {
            $scope.saving = true;
            answer.post($scope.answer)
            .then(function (response) {
                $scope.answers.push(response);
                $scope.cancel();
            }, function (reason) {
                $scope.err = reason.data.message;
            }).finally(function () {
                $scope.saving = false;
            });
        };
    }

    $scope.viewQuestion = function (ev, question) {
    };
});