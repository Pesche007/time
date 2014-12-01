'use strict';

angular.module('time')
  .controller('TimeListCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	

  })