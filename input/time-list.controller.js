'use strict';

angular.module('time')
  .controller('TimeListCtrl', function ($scope, $filter, $http, $log, cfg, statePersistence, ResourcesService) {
	cfg.GENERAL.CURRENT_APP = 'time';
	//OPTIONS
	$scope.treeOPT=	{editItems:0, companies:[], selectedComp:null};
	$scope.showAllProjects=0;

	ResourcesService.listCompanies().then(function(result) {
   		$scope.treeOPT.companies=result.data.companyData;
       	}, function(reason) {//error
       		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	}); 
	$scope.treeNew=[];
	$scope.timeUpdate = function(obj){		
		ResourcesService.listProjects(obj.id).then(function(result) {
			$scope.treeOPT.selectedComp=obj;
			$scope.treeOPT.selectedComp.disableClick=1;
			$scope.treeOPT.selectedComp.projects=result.data.projectData;
	       	}, function(reason) {//error
	       		alertsManager.addAlert('Could not get projects. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});		
	};
	$scope.treeNewentry = function (item) {
		$scope.treeNew.push({'cmpid':$scope.treeOPT.selectedComp.id, 'cmptitle':$scope.treeOPT.selectedComp.title, 'prjid':item.id, 'prjtitle':item.title, 'date':'','time':'', 'comment':''});
		};
	$scope.resetTreeView = function(){
		$scope.treeOPT.selectedComp=null;
	};
	//Datepicker
	$scope.dt = $filter('date')(new Date(), 'yyyy-MM-dd');
	$scope.loadDate = function(dir){
		var currentdate = new Date($scope.dt);
		$scope.dt=currentdate.setDate(currentdate.getDate() + dir);			
		};	
	$scope.opened=[];
	$scope.open = function($event, openid) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened[openid] = !$scope.opened[openid]
		};	
	$scope.formatedate = function (obj){ 
		obj.date = $filter('date')(obj.date, 'dd.MM.yyyy');
		};
	//Calculate SUm
	$scope.displaySum = function(){
		var times = $scope.treeNew.map(function(e){return e.time});
		var sum=0;
		for(var i=0;i<times.length;i++){
			if(times[i]){
				if(times[i].length===9){
					var parts=times[i].split('-');
					if(parts[0] && parts[1] && (parts[1]-parts[0]>0)){
						var diff=parts[1]-parts[0];
						var hour=Math.floor(diff/100);			
						var res = Math.round(100*(hour+(diff-hour*100)/60))/100;
						sum+=parseFloat(res);
					}
				}	
				else{
					sum+=parseFloat(times[i]);
				}		
			}
		}
		return sum;
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
		statePersistence.setState('time-list', {treeNew: $scope.treeNew, showAllProjects:$scope.showAllProjects});
		});
    var persVar=statePersistence.getState('time-list');
      if(persVar) {
    	for(var key in persVar){
    		$scope[key]=persVar[key];
    	}    	
    }
  });