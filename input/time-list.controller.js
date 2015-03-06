'use strict';

angular.module('time')
  .controller('TimeListCtrl', function ($scope, $filter, $http, $log, cfg, statePersistence, ResourcesService) {
	cfg.GENERAL.CURRENT_APP = 'time';
	
	$scope.treeOPT=	{editItems:0, companies:[], selectedComp:null, projects:null};
	ResourcesService.listCompanies().then(function(result) {
   		$scope.treeOPT.companies=result.data.companyData;
       	}, function(reason) {//error
       		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	}); 

	$scope.treeNew=[];
	$scope.timeUpdate = function(obj){		
		ResourcesService.listProjects(obj.id).then(function(result) {
			$scope.treeOPT.selectedComp=obj;
			$scope.treeOPT.projects=result.data.projectData;
	       	}, function(reason) {//error
	       		alertsManager.addAlert('Could not get projects. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});		
	};
	//Open/hide tree
	$scope.treeToggleChildren = function(obj) {		
		obj.childrenVisible = !obj.childrenVisible;
		};
	$scope.treeNewentry = function (item) {
		$scope.treeNew.push({'cmpid':$scope.treeOPT.selectedComp.id, 'cmptitle':$scope.treeOPT.selectedComp.title, 'prjid':item.id, 'prjtitle':item.title, 'date':'','time':'', 'comment':''});
		};
	$scope.resetTreeView = function(){
		$scope.treeOPT.selectedComp=null;
	};
	//Datepicker
	$scope.opened=[];
	$scope.open = function($event, openid) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened[openid] = !$scope.opened[openid]
		};	
	$scope.formatedate = function (obj){
		//Callend whenever a date is selected. Because the date is stored unformatted, when performing a row-copy, the datepicker date gets rewritten with unformatted date. 
		obj.date = $filter('date')(obj.date, 'dd.MM.yyyy');
		};
	//DUPLICAZE FORM TREE_INPUT		
	$scope.treeInputTableCopy = function(obj, index){
		$scope.treeNew.splice(index, 0, angular.copy(obj)); //from http://stackoverflow.com/questions/19333023/ngmodel-reference-when-pushed-into-array
		};
	$scope.treeInputTableRemove = function(index){
		$scope.treeNew.splice(index, 1);
		};	
		
	//Persistance
    $scope.$on('$destroy', function(){
		statePersistence.setState('time-list', {treeNew: $scope.treeNew});
		});
    var persVar=statePersistence.getState('time-list');
      if(persVar) {
    	for(var key in persVar){
    		$scope[key]=persVar[key];
    	}    	
    }
  });