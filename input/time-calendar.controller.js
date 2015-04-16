'use strict';

angular.module('time')
  .controller('TimeCalendarCtrl', function ($scope, $filter, $http, $log, cfg, statePersistence, ResourcesService, WorkrecordService, TimeService) {
	cfg.GENERAL.CURRENT_APP = 'time';

	//Options
	$scope.treeOPT={companies:[], selectedComp:null};
	$scope.showAllProjects=0;
	$scope.showWeekend=false;
	$scope.eventOPT={editEntry:0, monthsloaded:[], viewfrom:'', viewto:''};
	$scope.eventfocus={'visible': false, 'companyTitle':'', 'companyID':'', 'title':'', 'comment':'', 'time':'', 'decimaltime':'', 'error':false, 'calEvent':{}};

	//API
	ResourcesService.listCompanies().then(function(result) {
   		$scope.treeOPT.companies=result.data.companyModel;
       	}, function(reason) {//error
       		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	}); 
	//Project Tree
	$scope.timeUpdate = function(obj){		
		ResourcesService.listProjects(obj.id).then(function(result) {
			$scope.treeOPT.selectedComp=obj;
			$scope.treeOPT.selectedComp.disableClick=1;
			$scope.treeOPT.selectedComp.projects=result.data.projectModel;
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
	$scope.API.Addelements = function(month, year){
	   	WorkrecordService.list().then(function(result) {
	   		for(var i=0; i<result.data.workRecordData.length;i++){
	   			var current=result.data.workRecordData[i];
	   			var startTime=new Date(current.startAt);
				var endTime=new Date(startTime.getTime() + (current.durationHours*60+current.durationMinutes)*60000);
	   			$scope.events.push({'id':current.id, 'companyID':'a1', 'companyTitle':'Firma', 'prjid':current.projectId, 'resourceId':current.resourceId, 'title':'Projekt', 'start':startTime, 'end':endTime, rateId:current.rateId, 'allDay':false, 'comment':'', 'isBillable':current.isBillable, 'status':1});	
	   			}	   		
	     	}, function(reason) {//error
	       		alertsManager.addAlert('Could not get work records. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});			
	};
	$scope.events=[];
	$scope.eventSource=[$scope.events];

	//Change in month -> load new month data
	$scope.loadIntoView = function(start, end){		
		$scope.eventOPT.viewfrom=start;
		$scope.eventOPT.viewto=end;	
		$scope.checkCalendarViewLoaded($filter('date')(start, 'M'), $filter('date')(start, 'yyyy'));
		$scope.checkCalendarViewLoaded($filter('date')(end, 'M'), $filter('date')(end, 'yyyy'));				
		};
	$scope.checkCalendarViewLoaded = function (m, y) {
		if($scope.eventOPT.monthsloaded[y]===undefined) {
			$scope.eventOPT.monthsloaded[y]=[];
			}
		if($scope.eventOPT.monthsloaded[y].indexOf(m)===-1) {
			$scope.API.Addelements(m, y);
			$scope.eventOPT.monthsloaded[y].push(m);
			}		
		};
	$scope.toggleWeekends = function(dir){
		if($scope.showWeekend!==dir){
			$scope.showWeekend=!$scope.showWeekend;
			$scope.myCalendar.fullCalendar('destroy');
		 	$scope.uiConfig.calendar.weekends=$scope.showWeekend;
			$scope.myCalendar.fullCalendar('render');
		}
	}
	//Set event detail window through -> eventfocus
	$scope.eventdetailsset = function(calEvent){
		var timeFrom=$scope.formatAddLeadingZero(calEvent.start.getHours()) + '' + $scope.formatAddLeadingZero(calEvent.start.getMinutes());
		var timeTo=$scope.formatAddLeadingZero(calEvent.end.getHours()) + '' + $scope.formatAddLeadingZero(calEvent.end.getMinutes());
		var time=timeFrom + '-' + timeTo;
		var timeDecimal=$scope.calcTime(timeFrom, timeTo);
		$scope.eventfocus=angular.copy(calEvent);
		$scope.eventfocus.visible=true;
		$scope.eventfocus.time=time;
		$scope.eventfocus.decimaltime=timeDecimal;
		$scope.eventfocus.calEvent=calEvent;
		};
	//Save changes in entry details - check hours:minutes and save in OBJ
	$scope.eventdetailssave = function(){
		var time = $scope.eventfocus.time.split('-');
		if(time[0] && time[0].length===4 && time[1] && time[1].length===4 && time[1]>time[0]){
			$scope.eventfocus.calEvent.comment = $scope.eventfocus.comment;
			$scope.eventfocus.calEvent.start.setHours(time[0].substr(0, 2), time[0].substr(2, 2), 0);
			$scope.eventfocus.calEvent.end.setHours(time[1].substr(0, 2), time[1].substr(2, 2), 0);
			$scope.eventUpdate($scope.eventfocus.calEvent);					
			}
		else {
			$scope.eventfocus.error='Start time bigger than end time.';
			}
		};
	//Delete event from entry detail view, event is saved in eventfocus
	$scope.eventdetailsdelete = function() {
		$scope.deleteExistingMulti($scope.eventfocus.calEvent, $scope.events, '_id');
		$scope.cleareventfocus();
		};
	$scope.eventUpdate = function(calEvent){
		var diff = calEvent.end-calEvent.start;
		var timeObj=TimeService.msToHoursMinutes(diff);						
		WorkrecordService.put(calEvent.id, calEvent.prjid, calEvent.resourceId, calEvent.start, timeObj.h, timeObj.m, calEvent.rateId, calEvent.isBillable).then(function(result) {
			calEvent.status=4;
   			}, function(reason) {//error
   			alertsManager.addAlert('Could not update work record. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
			}); 
	};
	//adds event, "eid" because "id" makes events double (i.e. resizing one resizes the other)	
   $scope.addEvent = function(date, eventoptions, showdetails) {
   		console.log(eventoptions)
		var newEvent = {
			companyID:$scope.treeOPT.selectedComp.id,
			companyTitle:$scope.treeOPT.selectedComp.title,
			eid: eventoptions.id,
			title: eventoptions.title,
			start: date,
			end: new Date(date.getTime() + 120*60000),
			comment:'',
			backgroundColor:eventoptions.color,
			allDay: false
			};
      $scope.events.push(newEvent);
	  if(showdetails) {
		  $scope.eventdetailsset(newEvent);
		  }
    	};
	//clear the entry details window 
	$scope.cleareventfocus = function(){
		$scope.eventfocus={'visible': false, 'companyTitle':'', 'companyID':'', 'title':'', 'comment':'', 'time':'', 'decimaltime':'', 'error':false, 'calEvent':{}};
		$scope.eventOPT.editEntry=0;
	};
	$scope.changeStatus = function(obj){
		if(obj.status===1 || obj.status===4){
			obj.status=2;			
		}		
	};
	//Time functions
	$scope.updateTime = function(caller){
		if(!$scope.eventfocus.time){
			return false;
		}
		if(caller==='fromto'){
			var parts=$scope.eventfocus.time.split('-');
			if(parts[0] && parts[0].length===4 && parts[1] && parts[1].length===4){
				$scope.eventfocus.decimaltime=$scope.calcTime(parts[0], parts[1], 0);
				}
		}
		if(caller==='hrs'){
			var parts=$scope.eventfocus.time.split('-');
			if(parts[0] && parts[0].length===4 && parts[1] && parts[1].length===4 && !isNaN($scope.eventfocus.decimaltime)){
				$scope.eventfocus.time=$scope.calcTime(parts[0], parts[1], 1);
				}
		}
	};
	$scope.calcTime = function(from, to, add){
		if(add){
			var decimal=($scope.eventfocus.decimaltime % 1).toFixed(2);
			var hour = Math.floor($scope.eventfocus.decimaltime - parseInt(decimal));
			var toNew = parseInt(from) + parseInt(hour*100) + parseInt(decimal*60);
			var res = from + '-' + toNew;
		}
		else {
			var diff = to-from;
			var hour=Math.floor(diff/100);			
			var res = Math.round(10*(hour+(diff-hour*100)/60))/10;			
		}
		return res;
	};    	
	//Calendar control
	$scope.calendarSimplecontrol = function(action){
		$scope.myCalendar.fullCalendar(action);
		};
	$scope.calendarAdvancedcontrol = function(action, option){
		$scope.myCalendar.fullCalendar(action, option);
		};	
	//Filter only events within view
	 $scope.daterangefilter = function (item) {
        return (item.start >= $scope.eventOPT.viewfrom && item.end <= $scope.eventOPT.viewto);
    };	


	//Persistance
    $scope.$on('$destroy', function(){
		statePersistence.setState('time-calendar', {showAllProjects:$scope.showAllProjects, showWeekend:$scope.showWeekend});
		});
    var persVar=statePersistence.getState('time-calendar');
      if(persVar) {
    	for(var key in persVar){
    		$scope[key]=persVar[key];
    	}    	
    }

	//Formats number with leading 0
	$scope.formatAddLeadingZero = function(input){
		return (input<10?'0':'')+input;
		};

	//Calendar Config	
    $scope.uiConfig = {
      calendar:{
        height: 500,
        editable: true,
		defaultView: 'agendaWeek',
		firstDay:1, 
		axisFormat: 'HH:mm',
		timeFormat: 'HH:mm{ - HH:mm}',
		scrollTime: '08:00:00', //v2
		firstHour : 8, //v1
        header:false,
        weekends:$scope.showWeekend,
		columnFormat:{
		    week: 'ddd d.M.',
			day: 'dddd d.M.' 
			},
		businessHours:{
			start: '08:00', 
			end: '18:00', 		
			dow: [ 1, 2, 3, 4, 5 ]
			},
		droppable: true,
		drop: function (date, allDay, jsEvent, ui) {
			var eventoptions = JSON.parse(ui.helper[0].getAttribute('data-options'));
			$scope.addEvent(date, eventoptions, 1);
			},
		eventDragStop: function(calEvent){			
			$scope.eventUpdate(calEvent);
			},
        eventClick: function(calEvent) {	
			$scope.eventdetailsset(calEvent);
	    	},
		eventResize: function(calEvent) {
			$scope.eventUpdate(calEvent);
			},
		viewRender: function(view) {		
			$scope.loadIntoView(view.start, view.end);
			}
     	}
    };
});