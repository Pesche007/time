'use strict';

angular.module('time', ['core'])
.config(function ($stateProvider) {
	$stateProvider
	.state('time', {
		url: '/tree',
		controller: 'TreeCtrl',
		templateUrl: 'app/time/tree.html',
		authenticate: true
	})
});
