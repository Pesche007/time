'use strict';

angular.module('time', [])
.config(function ($stateProvider) {
	$stateProvider
	.state('time', {
		url: '/tree',
		controller: 'TreeCtrl',
		templateUrl: 'app/time/tree.html',
		authenticate: true
	})
});
