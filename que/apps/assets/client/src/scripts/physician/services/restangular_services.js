quePhysicianApp
.factory('Physicians', function (Restangular, Physician) {
    return _.extend(Restangular.one('physicians'), Physician);
})
.factory('AvailabilitySettings', function (Restangular, Physician) {
    return Restangular.service('availability-settings', Restangular.one('physicians', Physician.id));
})
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
.factory('Hours', function (Restangular) {
    return Restangular.service('hours');
})