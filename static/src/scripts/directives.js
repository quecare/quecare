var queDirectives = angular.module('QueDirectives', []);

queDirectives
.directive('savingToast', function () {
    return {
        restrict: 'E',
        template: '<div class="saving-toast">Saving...</div>'
    }
})
.directive('loading', function () {
    return {
        restrict: 'E',
        template: '<i class="fa fa-spinner fa-spin fa-2x"></i>'
    }
})
.directive('onEvent', function () {
    return {
        restrict: 'A',
        scope: {onEvent: '@', callback: '&'},
        link: function (scope, ele, attrs, ctrl) {
            ele.on(scope.onEvent, function () {
                scope.callback();
            })
        }
    }
})
.directive('upload', function (LoadingModal, MessageModal, Physician, Physicians, $location) {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs, ctrl) {
            var host = $location.host(), uploadUrl;

            if (host.indexOf('localhost') > -1) {
                uploadUrl = '//' + host + ':8080/upload';
            } else {
                uploadUrl = '//quecare-1383.appspot.com/upload';
            }

            var pattern = new RegExp('(\.|\/)(jpe?g|png)$'),
                maxFileSize = 5e+6,
                minFileSize = 1;

            scope.options = {
                url: uploadUrl,
                add: function (e, data) {
                    var file = data.files[0];

                    if (!pattern.test(file.type)) {
                        MessageModal('Image error', 'Invalid image selected.');
                        return false;
                    }

                    if (file.size < minFileSize) {
                        MessageModal('Image error', 'Are you sure it\'s an image.');
                        return false;
                    }

                    if (file.size > maxFileSize) {
                        MessageModal('Image error', 'Image too large.');
                        return false;
                    }
                    data.process().done(function () {
                        LoadingModal('Uploading image').then(function (modal) {
                            var message;
                            data.submit().then(function (response) {
                                Physicians.profile_pic = response.url;
                                Physicians.put()
                                .then(function (response) {
                                    _.extend(Physician, response);
                                }, function (reason) {
                                    message = reason.data.message;
                                }).finally(function () {
                                    modal.scope.dismiss();
                                });
                            }, function (response) {
                                message = response.message;
                                modal.scope.dismiss();
                            });

                            modal.closed.then(function () {
                                message && MessageModal('Upload error', message);
                            });
                        });
                    });
                },
                fail: function (e, data) {
                    MessageModal('Upload error', 'Something happened while connecting to upload server.');
                }
            };
        }
    }
})