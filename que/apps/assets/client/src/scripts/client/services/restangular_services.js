queApp
.factory('Questions', function (Restangular, Physician) {
    return Restangular.service('questions', Restangular.one('physicians', Physician.id));
})
.factory('Answers', function (Restangular) {
    return function (question_id) {
        return Restangular.service('answers', Restangular.one('questions', question_id));
    }
})
.factory('VideoConsults', function (Restangular, Physician) {
    return Restangular.service('video-consults', Restangular.one('physicians', Physician.id));
})
.factory('Availability', function (Restangular, Physician) {
    return Restangular.service('availability', Restangular.one('physicians', Physician.id));
});
