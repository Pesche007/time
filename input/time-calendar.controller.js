'use strict';

angular.module('time')
  .controller('TimeCalendarCtrl', function ($scope, $filter, $http, cfg, uiCalendarConfig,  ResourcesService, WorkrecordService, TimeService, alertsManager) {
	cfg.GENERAL.CURRENT_APP = 'time';

	//Options
	$scope.treeOPT={showAllProjects:1, companies:[], selectedComp:null};
	$scope.showWeekend=false;
	$scope.eventOPT={editEntry:0, monthsloaded:{}, viewfrom:'', viewto:''};
	$scope.eventfocus={'visible': false, 'companyTitle':'', 'companyID':'', 'title':'', 'comment':'', 'time':'', 'decimaltime':'', 'error':false, 'calEvent':{}};

	//API
	ResourcesService.listCompanies().then(function(result) {
   		$scope.treeOPT.companies=result.data.companyModel;
       	}, function(reason) {//error
       		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	}); 
	//Project Tree
	$scope.timeUpdate = function(obj){		
		ResourcesService.listProjectsTree(obj.id).then(function(result) {
			$scope.treeOPT.selectedComp=obj;			
			$scope.treeOPT.selectedComp.projects=result.data.projectTreeNodeModel;
			$scope.treeOPT.selectedComp.projects.disableClick=1;
			console.log($scope.treeOPT.selectedComp)
	       	}, function(reason) {//error
	       		alertsManager.addAlert('Could not get projects. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});		
	};
	$scope.resetTreeView = function(){
		$scope.treeOPT.selectedComp=null;
	};

	//Calendar
    $scope.API={};
    $scope.clientprojects = {};
	$scope.events=[];
	$scope.eventSource=[$scope.events];    
	$scope.API.Addelements = function(month, year){
	   	WorkrecordService.list('closed').then(function(result) {   		   	
	   		for(var i=0; i<result.data.workRecordModel.length;i++){	   			
	   			var current=result.data.workRecordModel[i];	  		
	   			current.start=new Date(current.startAt);
	   			var d=new Date(current.startAt);
	   			current.end = new Date(d.setHours(d.getHours()+current.durationHours, d.getMinutes()+current.durationMinutes));	
	   			current.title=current.companyTitle + '\n' + current.projectTitle + '\n\n' + current.comment;	
	   			$scope.events.push(current);
	   			}	   		
	     	}, function(reason) {//error
	       		alertsManager.addAlert('Could not get work records. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});			
	};

	//Change in month -> load new month data
	$scope.loadIntoView = function(start, end){		
		$scope.eventOPT.viewfrom=start;
		$scope.eventOPT.viewto=end;	
		$scope.checkCalendarViewLoaded($filter('date')(start, 'M'), $filter('date')(start, 'yyyy'));
		$scope.checkCalendarViewLoaded($filter('date')(end, 'M'), $filter('date')(end, 'yyyy'));
		};
	$scope.checkCalendarViewLoaded = function (m, y) {
		if($scope.eventOPT.monthsloaded['year'+y]===undefined) {			
			$scope.eventOPT.monthsloaded['year'+y]=[];
			}
		if($scope.eventOPT.monthsloaded['year'+y].indexOf('month'+m)===-1) {
			$scope.API.Addelements(m, y);
			$scope.eventOPT.monthsloaded['year'+y].push('month'+m);
			}		
		};
	$scope.toggleWeekends = function(dir){
		if($scope.showWeekend!==dir){
			$scope.showWeekend=!$scope.showWeekend;
			uiCalendarConfig.calendars.myCalendar.fullCalendar('destroy');
		 	$scope.uiConfig.calendar.weekends=$scope.showWeekend;
			uiCalendarConfig.calendars.myCalendar.fullCalendar('render');
		}
	}
	//Set event detail window through -> eventfocus
	$scope.eventdetailsset = function(calEvent){
		var startTime=new Date(calEvent.start);
		var endTime=TimeService.addTimetoDate(calEvent.start, calEvent.durationHours, calEvent.durationMinutes);
		var res=TimeService.getFromToStartDuration(startTime,  calEvent.durationHours, calEvent.durationMinutes);
		var time=res.from+'-'+res.to;
		$scope.eventfocus=angular.copy(calEvent);
		$scope.eventfocus.start=startTime;
		$scope.eventfocus.visible=true;
		$scope.eventfocus.time=time;
		};
	//Save changes in entry details 
	$scope.eventdetailssave = function(){
		var res=TimeService.validateTime($scope.eventfocus.time);
		if(res){
			var cal=$scope.eventfocus;
			var d=angular.copy(cal.start);
			cal.startAt=new Date(d.setHours(res.hours, res.minutes));
			cal.durationHours=res.durationhours;
			cal.durationMinutes=res.durationminutes;
			WorkrecordService.put(cal).then(function(result) {
				updateEventEntry(result);			
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not update work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
			}); 
		}
		else {
			$scope.eventfocus.error='Bitte Zeit korrigieren';
			}
		};
	//Delete event from entry detail view, event is saved in eventfocus
	$scope.eventdetailsdelete = function() {
		var id=$scope.eventfocus.id;
		var index=$scope.events.map(function(e){return e.id;}).indexOf(id);
		if(index!==-1){		
			WorkrecordService.delete(id).then(function(result) {
				alertsManager.addAlert('Eintrag gelöscht.', 'success', 'fa-check', 1);
				$scope.events.splice(index, 1);
				$scope.cleareventfocus();
	   			}, function(reason) {//error
	   			alertsManager.addAlert('Could not update work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
			});
			
		}
	};
	//adds event	
   $scope.addEvent = function(datum, projectId, projectTitle, showdetails) {		
		var workrecord={companyId:$scope.treeOPT.selectedComp.id, companyTitle:$scope.treeOPT.selectedComp.title, projectId:projectId, projectTitle:projectTitle, resourceId:'RESOURCE', resourceName:'RESOURCE', durationHours:2, durationMinutes:0, comment:''};	
		var d = new Date(datum);
		var offset = d.getTimezoneOffset();
		d.setMinutes(offset);
		workrecord.startAt=angular.copy(d);
		workrecord.start=angular.copy(d);		
		workrecord.end = new Date(d.setMinutes(2*60));		
		WorkrecordService.post(workrecord).then(function(result) {
			alertsManager.addAlert('Eintrag gespeichert.', 'success', 'fa-check', 1);
			var data=result.data.workRecordModel;
			data.start=new Date(data.startAt);
			data.end=new Date(TimeService.addTimetoDate(data.start, data.durationHours, data.durationMinutes));
			data.title=$scope.treeOPT.selectedComp.title + '\n' + projectTitle
			$scope.events.push(data);
			if(showdetails) {
		  		$scope.eventdetailsset(data);
		  	}
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not update work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});
    	};
	//clear the entry details window 
	$scope.cleareventfocus = function(){
		$scope.eventfocus={'visible': false, 'companyTitle':'', 'companyID':'', 'title':'', 'comment':'', 'time':'', 'decimaltime':'', 'error':false, 'calEvent':{}};
		$scope.eventOPT.editEntry=0;
	};
	//Takes to result of a saving and updates the array of events
	var updateEventEntry = function(result){
		var data=result.data.workRecordModel;
		data.start=new Date(data.startAt);
		data.end=new Date(TimeService.addTimetoDate(data.start, data.durationHours, data.durationMinutes));
		data.title=data.companyTitle + '\n' + data.projectTitle + '\n\n' + data.comment;	
		var index=$scope.events.map(function(e){return e.id;}).indexOf(data.id);
		if(index!==-1){
			$scope.events[index]=data;
			$scope.eventdetailsset(data);
			alertsManager.addAlert('Eintrag gespeichert.', 'success', 'fa-check', 1);
		}		
	};
    	
	//Calendar control
	$scope.calendarSimplecontrol = function(action){
		uiCalendarConfig.calendars.myCalendar.fullCalendar(action);
		};
	$scope.calendarAdvancedcontrol = function(action, option){
		uiCalendarConfig.calendars.myCalendar.fullCalendar(action, option);
		};	
	//Filter only events within view
	 $scope.daterangefilter = function (item) {
        return (item.start >= $scope.eventOPT.viewfrom && item.end <= $scope.eventOPT.viewto);
    };	

	//Calendar Config	
    $scope.uiConfig = {
      calendar:{
        height: 500,
        editable: true,
		defaultView: 'agendaWeek',
		firstDay:1, 
		axisFormat: 'HH:mm',
		timeFormat: 'H:mm',
		scrollTime: '08:00:00', //v2
        header:false,
        weekends:$scope.showWeekend,
        columnFormat:{agendaWeek:'ddd D.M', day:'ddd D.M'},
        dayNamesShort:['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],      
		businessHours:{
			start: '08:00', 
			end: '18:00', 		
			dow: [ 1, 2, 3, 4, 5 ]
			},
		droppable: true,
		drop: function (date, allDay, jsEvent, ui) {
			var projectId = jsEvent.helper[0].dataset.id;			
			var projectTitle = jsEvent.helper[0].dataset.title;			
			$scope.addEvent(date, projectId, projectTitle, 1);
			},
		eventDrop: function(calEvent, delta, revertFunc, jsEvent, ui, view){
			$scope.calendarEventDrop(calEvent, delta)
		},
        eventClick: function(calEvent) {	
			$scope.eventdetailsset(calEvent);
	    	},
		eventResize: function(calEvent, delta) {
			$scope.calendarEventResize(calEvent, delta);
			},
		viewRender: function(view) {	
			$scope.loadIntoView(new Date(view.start), new Date(view.end));
			}
     	}
    };
  $scope.calendarEventDrop = function(calEvent, delta){
  		var deltaTime = TimeService.msToHourMinSec(delta)
		calEvent.startAt=TimeService.addTimetoDate(calEvent.startAt, deltaTime[0], deltaTime[1])
		WorkrecordService.put(calEvent).then(function(result) {
			updateEventEntry(result);
   			}, function(reason) {//error
   			alertsManager.addAlert('Could not update work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		}); 
    };
  $scope.calendarEventResize = function(calEvent, delta){
  		var deltaTime = TimeService.msToHourMinSec(delta)
  		calEvent.durationHours+=deltaTime[0];
  		calEvent.durationMinutes+=deltaTime[1]; 
		WorkrecordService.put(calEvent).then(function(result) {
			updateEventEntry(result);
   			}, function(reason) {//error
   			alertsManager.addAlert('Could not update work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});   		 		
    };    
});