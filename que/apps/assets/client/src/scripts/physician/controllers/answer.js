quePhysicianApp.controller('AnswersCtrl', function ($scope, $stateParams, Answers) {
    $scope.question = _.findWhere($scope.questions, {'id': $stateParams.id});
    var answer = Answers($scope.question.id)
    $scope.answers = answer.getList();
    $scope.addAnswer = function () {
        answer.post($scope.answer)
        .then(function (response) {
            $scope.answers.$object.push(response);
        }, function (reason) {
            console.log(reason);
        });
    };
});