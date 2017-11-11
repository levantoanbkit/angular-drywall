angular.module('app', [
  'ngRoute',
  'config',
  'base',
  'signup',
  'login',
  'account',
  'admin',
  'device',
  'services.i18nNotifications',
  'services.httpRequestTracker',
  'security',
  'templates.app',
  'templates.common',
  'ui.bootstrap',
  'services.socketIO',
  'ngDialog'
]);


// Node.js Express backend csurf module csrf/xsrf token cookie name
angular.module('app').config(['$httpProvider', 'XSRF_COOKIE_NAME', function($httpProvider, XSRF_COOKIE_NAME){
  $httpProvider.defaults.xsrfCookieName = XSRF_COOKIE_NAME;
}]);

angular.module('app').config(['$routeProvider', '$locationProvider', 'ngDialogProvider', function ($routeProvider, $locationProvider, ngDialogProvider) {
  
  $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
  });

  $routeProvider
    .when('/', {
      templateUrl: 'main.tpl.html',
      controller: 'AppCtrl'
    })
    .when('/contact', {
      templateUrl: 'contact.tpl.html',
      controller: 'ContactCtrl',
      title: 'Liên hệ'
    })
    .when('/about', {
      templateUrl: 'about.tpl.html',
      title: 'Tính năng'
    })
    .otherwise({
      templateUrl: '404.tpl.html',
      title: 'Page Not Found'
    });

  ngDialogProvider.setDefaults({
        className: "ngdialog-theme-default",
        plain: false,
        showClose: true,
        closeByDocument: true,
        closeByEscape: true,
        appendTo: false
    });
}]);

angular.module('app').run(['$location', '$rootScope', 'security', function($location, $rootScope, security) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  security.requestCurrentUser();

  // add a listener to $routeChangeSuccess
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    $rootScope.title = current.$$route && current.$$route.title? current.$$route.title: 'MACS-SSFG system';
  });
}]);

angular.module('app').controller('AppCtrl', ['$scope', 'i18nNotifications', 'localizedMessages', function($scope, i18nNotifications, localizedMessages) {

  $scope.notifications = i18nNotifications;

  angular.element(document).ready(function () {
    $scope.closeToggleWhenClickOutside();
  });

  $scope.closeToggleWhenClickOutside = function() {
    $(document).click(function (event) {
      var clickOver = angular.element(event.target);          
      var opened = angular.element(".navbar-collapse").hasClass("in");
      var parentNode = clickOver.eq(0).parent();
      var invalidParentNode = parentNode.hasClass("dropdown") || 
                              parentNode.hasClass("dropdown-toggle navbar-dropdown-admin xs") || 
                              parentNode.hasClass("container xs") || 
                              parentNode.hasClass("navbar-header xs") ||
                              parentNode.hasClass("navbar-collapse collapse in") ||
                              parentNode.hasClass("dropdown-menu");

      if (opened === true && !clickOver.hasClass("navbar-toggle") && !invalidParentNode) {
        angular.element("button.navbar-toggle.xs").click();
      }
    });
  };

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  $scope.$on('$routeChangeError', function(event, current, previous, rejection){
    i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
  });
}]);