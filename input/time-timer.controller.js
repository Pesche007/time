'use strict';

angular.module('time')
  .controller('TimeTimerCtrl', function ($scope, $filter, $interval, $http, $log, cfg, ResourcesService, TimeService, WorkrecordService, sharedProperties) {
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
		var workrecord={companyId:$scope.treeOPT.selectedComp.id, companyTitle:$scope.treeOPT.selectedComp.title, projectId:item.id, projectTitle:item.title, resourceId:'', durationHours:0, durationMinutes:0, timer:{stop:'', run:'', interval:''}, state:0, isRunning:true, isPaused :false, startAt: '', comment:''};
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
		var newDate=new Date();		
		angular.forEach($scope.treeNew, function(value) {
			if(value.state===1) {
				$scope.timeTimerpause(value);
				}
			});			
		if(obj.state===0) {//POST
			obj.startAt = newDate;					
			WorkrecordService.post(obj).then(function(result) {
				alertsManager.addAlert('Eintrag gespeichert.', 'success', 'fa-check', 1);				
				console.log(result.data.workRecordModel)
				obj = data=result.data.workRecordModel;
				obj.timer = {};
				obj.timer.stop=newDate;
				obj.timer.run=newDate;				
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not save work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
			});			
			}
		else {
			var newStart = new Date(Math.abs(newDate - (new Date(obj.timer.stop)-new Date(obj.startAt))));
			obj.startAt=newStart;
			obj.timer.stop='';
			obj.timer.run=newDate;									
			}
		obj.state=1;
		obj.timer.interval = $interval(function(){
			obj.timer.run=new Date();
			},1000);
		};
	$scope.timeTimerpause = function(obj){
		obj.timer.stop=new Date();
		obj.timer.run='';
		$interval.cancel(obj.timer.interval);
		obj.state=2;
		};
	$scope.timeTimerstop = function(obj){
		obj.timer.stop=new Date();
		obj.timer.run='';
		$interval.cancel(obj.timer.interval);
		obj.state=3;		
		var time=TimeService.calculateFromTo(obj.startAt, obj.timer.stop);
		if(time){
			obj.time=time.from+'-'+time.to;
		}
		else {
			obj.time='0';
		}		
	};
	$scope.itemRemove = function(index){
		$scope.treeNew.splice(index, 1);
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
			diff = Math.abs(new Date(obj.timer.run) - obj.startAt);
			sumtime=parseInt(sumtime+diff);						
			}
		else {
			diff = Math.abs(new Date(obj.timer.stop) - new Date(obj.startAt));
			sumtime=parseInt(sumtime+diff);				
			}		
		return $scope.msToTime(sumtime);
		};
	//Format miliseconds to time
	$scope.msToTime = function(s) {
		function addZ(n) {
			return (n<10? '0':'') + n;
			}
		var timeArr=$scope.msToHourMinSec(s);
		return addZ(timeArr[0]) + ':' + addZ(timeArr[1]) + ':' + addZ(timeArr[2]);		
	};
	//Fromat miliseconds to hours.minutes
	$scope.msToHoursDecimal	= function (s){
		var timeArr=$scope.msToHourMinSec(s);
		var dechrs=Math.round(((timeArr[1]*60 + timeArr[2])/3600)*100)/100;
		return timeArr[0]+dechrs;
		};
	//Get hours, minutes and seconds form miliseconds
	$scope.msToHourMinSec = function (s) {
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;	
		return new Array(hrs, mins, secs);		
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