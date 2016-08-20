quePhysicianApp.controller('SettingsCtrl', function ($scope) {

})
.controller('ProfileCtrl', function ($scope, Physicians, Modals) {
    $scope.physician = Physicians;

    $scope.saveProfile = function () {
        var messageHeading, message;
        Modals.loadingModal('Saving record')
        .then(function (modal) {

            $scope.physician.put()
            .then(function (response) {
                _.extend($scope.physician, response);
                messageHeading = 'Saved';
                message = 'Profile info updated'
            }, function (response) {
                messageHeading = 'Profile update failed'
                $scope.saveProfileErr = message = response.data.message;
            }).finally(function () {
                modal.scope.dismiss();
            });

            modal.closed.then(function () {
                Modals.messageModal(messageHeading, message);
            });
        });
    };
})
.controller('PasswordCtrl', function ($scope) {

})
