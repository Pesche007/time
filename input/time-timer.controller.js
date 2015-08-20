'use strict';

angular.module('time')
  .controller('TimeTimerCtrl', function ($scope, $filter, $interval, $http, cfg, alertsManager, ResourcesService, TimeService, WorkrecordService, sharedProperties) {
	cfg.GENERAL.CURRENT_APP = 'time';
	
	$scope.treeOPT=	{editItems:0, companies:[], selectedComp:null};
	$scope.showAllProjects=1;
	$scope.showListControls=0;
	$scope.treeNew=[];	

	ResourcesService.listCompanies().then(function(result) {
   		$scope.treeOPT.companies=result.data.companyModel;
       	}, function(reason) {//error
       		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	}); 

	$scope.loadWorkRecords = function(){
	   	WorkrecordService.list().then(function(result) {    	
			angular.forEach(result.data.workRecordModel, function(value) {
				if(value.isRunning){
	   				value.timer = {stop:'', run:'', interval:''};
	   				value.state=1;		   				
	   				value.timer.interval = $interval(function(){
						value.timer.run=new Date();
					},1000);
					this.push(value);
				}
	   			if(value.isPaused){	   				
	   				value.timer = {stop:'', run:'', interval:''};
	   				value.state=2;
	   				var timeStop = TimeService.addTimetoDate(value.startAt, value.durationHours, value.durationMinutes);		   				
	   				value.timer.stop = new Date(timeStop);
	   				this.push(value);
	   			}				
			}, $scope.treeNew);	   				
	     }, function(reason) {//error
	     	alertsManager.addAlert('Could not get work records. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});
	};
	$scope.loadWorkRecords();

	$scope.timeUpdate = function(obj){		
		ResourcesService.listProjectsTree(obj.id).then(function(result) {
			$scope.treeOPT.selectedComp=obj;
			$scope.treeOPT.selectedComp.disableClick=1;
			$scope.treeOPT.selectedComp.projects=result.data.projectTreeNodeModel;
	       	}, function(reason) {//error
	       		alertsManager.addAlert('Could not get projects. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});		
	};
	$scope.treeNewentry = function (item) {
		var workrecord={companyId:$scope.treeOPT.selectedComp.id, companyTitle:$scope.treeOPT.selectedComp.title, projectId:item.id, projectTitle:item.title, resourceId:'RESOURCE', resourceName:'RESOURCE', durationHours:0, durationMinutes:0, timer:{stop:'', run:'', interval:''}, state:0, isRunning:true, isPaused :false, startAt: '', comment:''};
		$scope.treeNew.push(workrecord);
		};
	$scope.resetTreeView = function(){
		$scope.treeOPT.selectedComp=null;
	};		
	//Callend whenever a date is selected. Because the date is stored unformatted, when performing a row-copy, the datepicker date gets rewritten with unformatted date. 		
	$scope.formatedate = function (obj){
		obj.date = $filter('date')(obj.date, 'dd.MM.yyyy');
		};	
	//Timer		
	$scope.timeTimerstart = function(obj){		
		for(var i=0; i<$scope.treeNew.length;i++){
			if($scope.treeNew[i].state===1) {
				$scope.timeTimerpause($scope.treeNew[i]);
			}
		}	
		var newDate = new Date();
		if(obj.state===0) {//Initial Start => POST			
			obj.startAt = newDate;							
			WorkrecordService.post(obj).then(function(result) {								
				obj = angular.extend(obj, result.data.workRecordModel);				
				obj.timer={stop:newDate};
				obj.timer.interval = $interval(function(){obj.timer.run=new Date();},1000);
				alertsManager.addAlert('Eintrag gespeichert.', 'success', 'fa-check', 1);				
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not save work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
			});			
		}	
		else {//Timer already paused => PUT
			var newStart = new Date(Math.abs(newDate - (new Date(obj.timer.stop)-new Date(obj.startAt))));
			obj.startAt=newStart;
			obj.timer.stop='';
			obj.timer.run=newDate;
			obj.isPaused=false;
			obj.isRunning=true;
			WorkrecordService.put(obj).then(function(result) {
				alertsManager.addAlert('Eintrag gespeichert.', 'success', 'fa-check', 1);						
				obj.timer.interval = $interval(function(){obj.timer.run=new Date();},1000);
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not save work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
			});													
		}
		obj.state=1;					
	};
	$scope.timeTimerpause = function(obj){
		obj.timer.stop=new Date();
		obj.timer.run='';
		$interval.cancel(obj.timer.interval);
		obj.state=2;
		obj.isRunning=false;
		obj.isPaused=true;
		var diff = Math.abs(new Date(obj.timer.stop) - new Date(obj.startAt));
		var times = TimeService.msToHourMinSec(diff);
		obj.durationHours = times[0];
		obj.durationMinutes = times[1];				
		WorkrecordService.put(obj).then(function(result) {
			alertsManager.addAlert('Eintrag gespeichert.', 'success', 'fa-check', 1);						
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not save work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});		
	};
	$scope.timeTimerstop = function(obj){
		obj.timer.stop=new Date();		
		obj.timer.run='';
		obj.isRunning=false;
		obj.isPaused=false;		
		$interval.cancel(obj.timer.interval);
		obj.state=3;		
		var time=TimeService.calculateFromTo(obj.startAt, obj.timer.stop);
		if(time){
			if(time.from === time.to){
				time.to=parseInt(time.to)+1;
			}
			obj.time=time.from+'-'+time.to;
		}
		else {
			obj.time='0';
		}		
	};
	$scope.timeTimerSave = function(obj){
		var times = TimeService.validateTime(obj.time);
		if(times){
			obj.durationHours=times.durationhours;
			obj.durationMinutes=times.durationminutes;
			var newDate = new Date(obj.startAt);
			newDate.setHours(times.hours);
			newDate.setMinutes(times.minutes);
			obj.startAt = newDate;
		}
		WorkrecordService.put(obj).then(function(result) {
			alertsManager.addAlert('Eintrag gespeichert.', 'success', 'fa-check', 1);						
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not save work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});	
	};
	$scope.timeTimerRemove = function(obj){
		if(!obj.id){
			var index = $scope.treeNew.indexOf(obj);
			if(index !== -1){
				$scope.treeNew.splice(index, 1);
			}			
			return true;
		}
		WorkrecordService.delete(obj.id).then(function(result) {
			alertsManager.addAlert('Eintrag gelöscht.', 'success', 'fa-check', 1);
			var index = $scope.treeNew.map(function(a){return a.id}).indexOf(obj.id);
			if(index !== -1){
				$scope.treeNew.splice(index, 1);
			}
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not delete work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});
		};
	//Trigger States of start/pause/stop buttons				
	$scope.checktimer = function(obj, act){
		if(obj.state===0) {
			if(act==='start') {
				return false;
				}
			if(act==='stop' || act==='pause') {
				return true;
				}
			}
		else if(obj.state===1) {
			if(act==='start') {
				return true;
				}
			if(act==='stop' || act==='pause') {
				return false;
				}
			}						
		else if(obj.state===2) {
			if(act==='start' || act==='stop') {
				return false;
				}
			if(act==='pause') {
				return true;		
				}
			}		
		else if(obj.state===3) {
			return true;			
			}					
		};
	//Display difference in time
	$scope.calctime = function(obj){
		var sumtime=0, diff=0;
		if(obj.state===0) {
			return '00:00:00';
			}
		else if(obj.timer.run!=='') {
			diff = Math.abs(new Date(obj.timer.run) - new Date(obj.startAt));
			sumtime=parseInt(sumtime+diff);						
			}
		else {
			diff = Math.abs(new Date(obj.timer.stop) - new Date(obj.startAt));
			sumtime=parseInt(sumtime+diff);				
			}			
		if(isNaN(sumtime)){
			return '00:00:00';
		}
		else {
			var times = TimeService.msToHourMinSec(sumtime);
			return TimeService.formatAddLeadingZero(times[0]) + ':' +TimeService.formatAddLeadingZero(times[1]) + ':' + TimeService.formatAddLeadingZero(times[2]);
		}
	};
	//Fromat miliseconds to hours.minutes
	$scope.msToHoursDecimal	= function (s){
		var timeArr=TimeService.msToHourMinSec(s);
		var dechrs=Math.round(((timeArr[1]*60 + timeArr[2])/3600)*100)/100;
		return timeArr[0]+dechrs;
		};
	//Initie timer after peristance call
	var timeTimerinit = function(){		
		for(var i=0; i<$scope.treeNew.length; i++){
			if($scope.treeNew[i].state===1){//Timer started
				$scope.timeTimerstart($scope.treeNew[i]);
			}
			if($scope.treeNew[i].state===2){//Timer Paused
			}	
			if($scope.treeNew[i].state===3){//Timer Stoped
			}
		}
	};
	/** DEBUG **/
	$scope.sharedProperties = sharedProperties.getProperties();	
});