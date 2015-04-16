'use strict';

angular.module('time')
  .controller('TimeListCtrl', function ($scope, $filter, $http, $log, cfg, statePersistence, ResourcesService, WorkrecordService, alertsManager, TimeService) {
	cfg.GENERAL.CURRENT_APP = 'time';
	//OPTIONS
	$scope.treeOPT=	{editItems:0, companies:[], selectedComp:null, treeNewSaved:1};
	$scope.showAllProjects=0;
	//Get Companies
	ResourcesService.listCompanies().then(function(result) {
   		$scope.treeOPT.companies=result.data.companyModel;
       	}, function(reason) {//error
       		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	}); 
  	//Get WorkRecords
	$scope.treeNew=[];
   	WorkrecordService.list().then(function(result) {
   		for(var i=0; i<result.data.workRecordData.length;i++){
   			var current=result.data.workRecordData[i];
			var currentTime=current.durationHours+Math.round((current.durationMinutes/60)*100)/100;
   			$scope.treeNew.push({'id':current.id, 'cmpid':'a1', 'cmptitle':'Firma', 'prjid':current.projectId, 'prjtitle':'Projekt', 'time':currentTime, 'comment':'', 'isBillable':current.isBillable, 'status':1});
   			}	   		
     	}, function(reason) {//error
       		alertsManager.addAlert('Could not get work records. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	});

   	//Get Projects for selected Company
	$scope.timeUpdate = function(obj){		
		ResourcesService.listProjects(obj.id).then(function(result) {
			$scope.treeOPT.selectedComp=obj;
			$scope.treeOPT.selectedComp.disableClick=1;
			$scope.treeOPT.selectedComp.projects=result.data.projectModel;
	       	}, function(reason) {//error
	       		alertsManager.addAlert('Could not get projects. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});		
	};
	//Reset Project View
	$scope.resetTreeView = function(){
		$scope.treeOPT.selectedComp=null;
	};

	//Add new empty Work Record => Status 3
	$scope.treeNewentry = function (item) {
		$scope.treeNew.push({'id':'', 'cmpid':$scope.treeOPT.selectedComp.id, 'cmptitle':$scope.treeOPT.selectedComp.title, 'prjid':item.id, 'prjtitle':item.title, 'time':'', 'comment':'', 'isBillable':true, 'status':3});
		$scope.treeOPT.treeNewSaved=0;
		};
	//Save Work Records
	$scope.treeSave = function(){
		var startDate=new Date($scope.dt);
		startDate.setHours(8,0,0,0);
		var resourceId = 'pescheID';
		var rateId = '84627080-9bfd-4da8-8887-66096650bda5';
		var current;
		var saveSuccess=1;
		for(var i=0; i<$scope.treeNew.length;i++){
			current = $scope.treeNew[i];
			if(current.status===2 || current.status===3){				
				var timeObj=TimeService.timeToHoursMinutes(current.time);	
				var projectId = current.prjid;
				var isBillable=current.isBillable;
				if (current.status===3)	{//new changed unsaved
					WorkrecordService.post(projectId, resourceId, startDate, timeObj.h, timeObj.m, rateId, isBillable, current).then(function(result) {		
						result.data.current.status=4;
						result.data.current.id=result.data.workRecordData.id;
			   			}, function(reason) {//error
			   			alertsManager.addAlert('Could not save work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);
			   			saveSuccess=0;		
					});
				}
				else if (current.status===2) {//existing changed unsaved					
					WorkrecordService.put(current.id, projectId, resourceId, startDate, timeObj.h, timeObj.m, rateId, isBillable).then(function(result) {					
						var index=findIndexbyKeyValue($scope.treeNew, 'id', result.data.workRecordData.id);
						$scope.treeNew[index].status=4; //saved
			   			}, function(reason) {//error
			   			alertsManager.addAlert('Could not update work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
			   			saveSuccess=0;
					});
				}
			}
		}
		if(saveSuccess){
			$scope.treeOPT.treeNewSaved=1;
		}
	};
	//Delete WorkRecord
	$scope.treeDelete = function(obj, index){
		if(obj.status!==3){
			WorkrecordService.delete(obj.id).then(function(result) {
				var index=findIndexbyKeyValue($scope.treeNew, 'id', obj.id);
				$scope.treeNew.splice(index, 1);
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not delete work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
			}); 			
		}
		else {
			$scope.treeNew.splice(index, 1);
		}
		$scope.treeOPT.treeNewSaved=$scope.isListSaved();
	};
	//Change Status of edited row   -> status=1 (existing) and status=4(newly saved) will change, status=2 is already changed and status=3 is already marked as new
	$scope.changeStatus = function(obj){
		if(obj.status===1 || obj.status===4){
			obj.status=2;			
		}
		$scope.treeOPT.treeNewSaved=0;
	};

	//HELPER
	//Find index of specific key -> value pair in object of arrays
	var findIndexbyKeyValue = function(obj, key, value){
		return obj.map(function(e) { return e[key];}).indexOf(value);
	};
	//Check if there are entries that are not saved
	$scope.isListSaved = function(){
		var statusArr = $scope.treeNew.map(function(e) { return e.status;});
		if(statusArr.indexOf(3)!==-1 || statusArr.indexOf(2) !==-1 ){
			return 0;
		}
		return 1;
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
	//Calculate Sum of hours
	$scope.displaySum = function(){
		return TimeService.displaySum($scope.treeNew);
	};
	//Row copy	
	$scope.treeInputTableCopy = function(obj, index){
		var newObj = angular.copy(obj);
		newObj.status=3;
		newObj.id='';
		$scope.treeNew.splice(index+1, 0, newObj); 
		};
		
	//Persistance
    $scope.$on('$destroy', function(){
		statePersistence.setState('time-list', {showAllProjects:$scope.showAllProjects});
		});
    var persVar=statePersistence.getState('time-list');
      if(persVar) {
    	for(var key in persVar){
    		$scope[key]=persVar[key];
    	}    	
    }
  });