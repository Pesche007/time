'use strict';

angular.module('time')
	.controller('TestCtrl', function ($scope, $modal, $modalInstance, data) {
	$scope.test=data;
    $scope.close = function(){
        $modalInstance.dismiss('cancel'); 
    };
    $scope.ok = function(){
        $modalInstance.close($scope.test);                                                                                        
    };	
});