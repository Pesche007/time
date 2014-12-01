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
	.state('time-tree-admin', {
		url: '/time-tree-admin',
		controller: 'TreeAdminCtrl',
		templateUrl: 'app/time/time-tree-admin.html',
		authenticate: true
	})	
	.state('time-tree-input', {
		url: '/time-tree-input',
		controller: 'TreeInputCtrl',
		templateUrl: 'app/time/time-tree-input.html',
		authenticate: true
	})	
	.state('time-list', {
		url: '/time-list',
		controller: 'TimeListCtrl',
		templateUrl: 'app/time/time-list.html',
		authenticate: true
	})				
});
