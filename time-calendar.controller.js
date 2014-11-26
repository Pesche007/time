'use strict';

angular.module('time')
  .controller('TimeCalendarCtrl', function ($scope, AppConfig, uiCalendarConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
		
	$scope.list1 = {title: 'AngularJS - Drag Me'};
	$scope.eventfocus={"visible": false, "title":"", "start":"", "end":"", "comment":"", "startTMP":"", "endTMP":"", "error":false, "calEvent":{}}
		
    $scope.events = [
	  {title: 'Test',start: new Date('2014/11/27 10:00'),end: new Date('2014/11/27 12:00'), allDay: false, 'comment':'', 'backgroundColor':'#996666'}
    ];
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
		defaultView: 'agendaWeek',
		firstDay:1, 
		axisFormat: 'HH:mm',
		timeFormat: {
		    agenda: 'H:mm{ - H:mm}'
			},
        header:{
          left: 'month agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
	        },
		titleFormat:{
			month: 'MMMM yyyy', 
			week: "d.M{ '&#8212;' d.M.yyyy}", 
			day: 'd.M.yyyy' 
			},
		columnFormat:{
		    week: 'ddd d.M',
			day: 'dddd' 
			},
		businessHours:{
			start: '08:00', 
			end: '18:00', 		
			dow: [ 1, 2, 3, 4, 5 ]
			},
		droppable: true,
		drop: function (date, allDay, jsEvent, ui) {
			var eventoptions = JSON.parse(ui.helper[0].getAttribute("data-options"));
			$scope.addEvent(date, eventoptions, 1);
			},
		eventDragStop: function(calEvent){
			$scope.eventdetailsset(calEvent);
			},
        eventClick: function(calEvent) {	
			$scope.eventdetailsset(calEvent);
	    	},
		eventResize: function(calEvent) {
			$scope.eventdetailsset(calEvent);
			}
     	}
    };
	$scope.eventdetailsset = function(calEvent){
		var startVal=calEvent.start.getHours()+":"+(calEvent.start.getMinutes()<10?'0':'') + calEvent.start.getMinutes();
		var endVal=calEvent.end.getHours()+":"+(calEvent.end.getMinutes()<10?'0':'') + calEvent.end.getMinutes();			
		$scope.eventfocus={"visible": true, "title":calEvent.title, "start":calEvent.start, "end":calEvent.end, "comment":calEvent.comment, "startTMP":startVal, "endTMP":endVal, "calEvent":calEvent}		
		}
	$scope.eventdetailssave = function(){
		$scope.eventfocus.calEvent.comment = $scope.eventfocus.comment;
		if(/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test($scope.eventfocus.startTMP) && /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test($scope.eventfocus.endTMP)) {
			var startArr=$scope.eventfocus.startTMP.split(":");
			var endArr=$scope.eventfocus.endTMP.split(":");
			if(!(startArr[0]>endArr[0] || (endArr[0]==startArr[0] && startArr[1]>endArr[1]))){
				$scope.eventfocus.calEvent.start.setHours(startArr[0], startArr[1], 0);
				$scope.eventfocus.calEvent.end.setHours(endArr[0], endArr[1], 0);
				$scope.cleareventfocus();				
				}
			else {
				$scope.eventfocus.error="Start time bigger than end time.";
				}
			}
		}
	$scope.eventdetailscancel = function(){
		$scope.cleareventfocus();
		}	
	$scope.eventdetailsdelete = function() {
		$scope.deleteExistingMulti($scope.eventfocus.calEvent, $scope.events, "_id");
		$scope.cleareventfocus();
		}
	$scope.cleareventfocus = function(){
		$scope.eventfocus={"visible": false, "title":"", "start":"", "end":"", "comment":"", "startTMP":"", "endTMP":"", "error":false, "calEvent":{}}
		}	
	
   $scope.addEvent = function(date, eventoptions, showdetails) {
		var newEvent = {
			id: eventoptions.id,
			title: eventoptions.title,
			start: date,
			end: new Date(date.getTime() + 120*60000),
			comment:'',
			backgroundColor:eventoptions.color,
			allDay: false
			}
      $scope.events.push(newEvent);
	  if(showdetails) $scope.eventdetailsset(newEvent)
    };	
	
	$scope.calendarsave = function(){
		console.log($scope.events)
		}
	
	$scope.eventSources = [$scope.events]

	//DUPLICATE FROM TIME - MAKE FActory
	$scope.deleteExistingMulti = function(data, model, selector) {
		for (var i = 0, len = model.length; i < len; i++) {
			if (model[i][selector]== data[selector]) {
				model.splice(i, 1);
				break;
				}
			}	
		}		
	})