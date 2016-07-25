queApp
.factory('Questions', function (Restangular) {
    return Restangular.service('questions');
})
.factory('Answers', function (Restangular) {
    return function (question_id) {
        return Restangular.service('answers', Restangular.one('questions', question_id));
    }
})
.factory('VideoConsults', function (Restangular) {
    return Restangular.service('video-consults');
})
.factory('Availability', function (Restangular) {
    return Restangular.service('availability');
});
