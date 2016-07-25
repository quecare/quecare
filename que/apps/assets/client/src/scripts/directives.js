var queDirectives = angular.module('QueDirectives', []);

queDirectives
.directive('menuLink', function() {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-link.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      $scope.isSelected = function() {
        return controller.isSelected($scope.section);
      };

      $scope.focusSection = function() {
        // set flag to be used later when
        // $locationChangeSuccess calls openPage()
        controller.autoFocusContent = true;
      };
    }
  };
})

.directive('menuToggle', [ '$timeout', '$mdUtil', function($timeout, $mdUtil) {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-toggle.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      $scope.isOpen = function() {
        return controller.isOpen($scope.section);
      };
      $scope.toggle = function() {
        controller.toggleOpen($scope.section);
      };

      $mdUtil.nextTick(function() {
        $scope.$watch(
          function () {
            return controller.isOpen($scope.section);
          },
          function (open) {
            // We must run this in a next tick so that the getTargetHeight function is correct
            $mdUtil.nextTick(function() {
              var $ul = $element.find('ul');
              var $li = $ul[0].querySelector('a.active');
              var docsMenuContent = document.querySelector('.docs-menu').parentNode;
              var targetHeight = open ? getTargetHeight() : 0;

              $timeout(function () {
                // Set the height of the list
                $ul.css({height: targetHeight + 'px'});

                // If we are open and the user has not scrolled the content div; scroll the active
                // list item into view.
                if (open && $li && $ul[0].scrollTop === 0) {
                  $timeout(function() {
                    var activeHeight = $li.scrollHeight;
                    var activeOffset = $li.offsetTop;
                    var parentOffset = $li.offsetParent.offsetTop;

                    // Reduce it a bit (2 list items' height worth) so it doesn't touch the nav
                    var negativeOffset = activeHeight * 2;
                    var newScrollTop = activeOffset + parentOffset - negativeOffset;

                    $mdUtil.animateScrollTo(docsMenuContent, newScrollTop);
                  }, 350, false);
                }
              }, 0, false);

              function getTargetHeight() {
                var targetHeight;
                $ul.addClass('no-transition');
                $ul.css('height', '');
                targetHeight = $ul.prop('clientHeight');
                $ul.css('height', 0);
                $ul.removeClass('no-transition');
                return targetHeight;
              }
            }, false);
          }
        );
      });

      var parentNode = $element[0].parentNode.parentNode.parentNode;
      if(parentNode.classList.contains('parent-list-item')) {
        var heading = parentNode.querySelector('h2');
        $element[0].firstChild.setAttribute('aria-describedby', heading.id);
      }
    }
  };
}])