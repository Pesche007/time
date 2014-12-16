'use strict';

angular.module('time')
  .controller('TimeReportCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');	
  })