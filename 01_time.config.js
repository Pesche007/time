'use strict';

angular.module('time', ['core', 'ui.grid', 'ui.grid.treeView', 'ui.calendar', 'ngDragDrop'])
.config(function ($stateProvider) {
	$stateProvider
	.state('time-list', {
		url: '/time-list',
		controller: 'TimeListCtrl',
		templateUrl: 'app/time/input/time-list.html',
		authenticate: true,
		parent: 'common'
	})
	.state('time-calendar', {
		url: '/time-calendar',
		controller: 'TimeCalendarCtrl',
		templateUrl: 'app/time/input/time-calendar.html',
		authenticate: true,
		parent: 'common'
	})	
	.state('time-tree-admin', {
		url: '/time-tree-admin',
		controller: 'TreeAdminCtrl',
		templateUrl: 'app/time/admin/time-tree-admin.html',
		authenticate: true,
		parent: 'common'
	})	
	.state('time-tree-input', {
		url: '/time-tree-input',
		controller: 'TreeInputCtrl',
		templateUrl: 'app/time/input/time-tree-input.html',
		authenticate: true,
		parent: 'common'
	})	
	.state('time-playground', {
		url: '/time-playground',
		controller: 'TimePlaygroundCtrl',
		templateUrl: 'app/time/input/time-playground.html',
		authenticate: true,
		parent: 'common'
	})
	.state('time-report', {
		url: '/time-report',
		controller: 'TimeReportCtrl',
		templateUrl: 'app/time/report/time-report.html',
		authenticate: true,
		parent: 'common'
	});	
});
