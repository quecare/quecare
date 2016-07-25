quePhysicianApp.controller('QuestionsCtrl', function ($scope, AllQuestions, Questions, Answers, $mdDialog, $mdMedia) {
    $scope.questions = AllQuestions;

    function DialogCtrl ($scope, $mdDialog, question) {
        $scope.question = question;
        var answer = Answers($scope.question.id);
        $scope.answers = answer.getList();

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

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
        var useFullScreen = $mdMedia('sm') || $mdMedia('xs');
        $mdDialog.show({
            controller: DialogCtrl,
            locals: {question: question},
            templateUrl: '/static/templates/physician/partials/answer.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: useFullScreen
        });
    };
});