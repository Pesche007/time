'use strict';

angular.module('time')
  .controller('TimeRatesCtrl', function ($scope, cfg, RatesService, alertsManager) {
	//Get Rates
	$scope.ratesOPT={ratesLoaded:0, rates:[]};	
	$scope.ratesStructure=[];
	RatesService.list().then(function(result) {
		$scope.ratesOPT.rates=result.data.ratesModel;
		$scope.ratesStructure=[
			{ name:'Name', field: 'title', inputType:'text'},
			{ name:'Stundensatz', field: 'rate', inputType:'number' },
			{ name:'Währung', field: 'currency', inputType:'select', dataSource: ['CHF', 'EUR', 'USD']},
			{ name:'Beschreibung', field: 'description', inputType:'textarea'}
		];
		$scope.ratesOPT.ratesLoaded=1;
	}, function(reason) {//error
		alertsManager.addAlert('Could not get rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	}); 
	//Handle Directive Call
	$scope.ratesFunction = function (action, param, data){
		if(action===2){//Save new
			rateNewSave(param);
		}
		if(action===3){//Edit Save
			rateEditSave(param);
		}
		if(action===4){//Remove
			rateEditRemove(param);
		}				
	};

	//Save Rates -> New
	var rateNewSave = function(param){
		RatesService.post(param).then(function(result) {
			$scope.ratesOPT.rates.push(result.data.ratesModel);			
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not create rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});
	};
	//Save Rates -> Edit
	var rateEditSave = function(param){
		RatesService.put(param).then(function(result) {
			var index = $scope.ratesOPT.rates.map(function(e) { return e.id;}).indexOf(param.id);
			$scope.ratesOPT.rates[index] = result.data.ratesModel;				
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not update rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		}); 		
	};
	//Delete Rates
	var rateEditRemove = function(param) {
		RatesService.delete(param.id).then(function(result) {
			var index = $scope.ratesOPT.rates.map(function(e) { return e.id;}).indexOf(param.id);
			$scope.ratesOPT.rates.splice(index, 1);	
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not delete rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
		}); 
	};	
 });