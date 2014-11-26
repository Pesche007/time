'use strict';

angular.module('time', ['core', 'ui.calendar', 'ngDragDrop'])
.config(function ($stateProvider) {
	$stateProvider
	.state('time', {
		url: '/tree',
		controller: 'TreeCtrl',
		templateUrl: 'app/time/tree.html',
		authenticate: true
	})
	.state('time-calendar', {
		url: '/time-calendar',
		controller: 'TimeCalendarCtrl',
		templateUrl: 'app/time/time-calendar.html',
		authenticate: true
	})	
});
