'use strict';

angular.module('time')
  .controller('TimeCalendarCtrl', function ($scope, $filter, AppConfig, uiCalendarConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');

	//API 
	$scope.API_addelements = function(month){
			console.log("Events added for month "+month)
			var data = [
			  {"title": "Test", "start": new Date('2014/'+month+'/10 10:00'), "end": new Date('2014/'+month+'/10 12:00'), "allDay": false, "comment":"", "backgroundColor":"#996666"},
			  {"title": "Best", "start": new Date('2014/'+month+'/11 13:00'), "end": new Date('2014/'+month+'/11 14:00'), "allDay": false, "comment":"", "backgroundColor":"#996666"},
			  {"title": "Zest", "start": new Date('2014/'+month+'/12 10:00'), "end": new Date('2014/'+month+'/12 12:00'), "allDay": false, "comment":"", "backgroundColor":"#996666"}
			  ];
			for(var i = 0; i < data.length; ++i) { $scope.events.push(data[i]); }
		}

	//Change in month -> load new month data
	$scope.loadIntoView = function(start, end){		
		$scope.eventOPT.viewfrom=start;
		$scope.eventOPT.viewto=end;
		var monthStart=$filter('date')(start, 'M');
		var monthEnd=$filter('date')(end, 'M');
		if($scope.eventOPT.months.indexOf(monthStart)==-1) {
			$scope.API_addelements(monthStart);
			$scope.eventOPT.months.push(monthStart);
			}
		if($scope.eventOPT.months.indexOf(monthEnd)==-1) {
			$scope.API_addelements(monthEnd);
			$scope.eventOPT.months.push(monthEnd);
			}		
		}
	$scope.get_tree = function () {
		return [{id: 'CmpA', title: 'UBS', type:'company', categories: [
					{id: 'PjtA1', title: 'Project A1', type:'project', categories: [
						 {id: 'SPjtA11', title: 'Sub-Project A11', type:'project', categories:[
						 	{id: 'SSPjtA11', title: 'Sub-Sub-Project A111', type:'project', categories: [], people:[]}
						], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}, 
						 {id: 'SPjtA12', title: 'Sub-Project A12', type:'project', categories:[
						 {id: 'SSPjtA12', title: 'Sub-Sub-Project A112', type:'project', categories: [], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
						 ], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
					 ]},
				]},
			  {id: 'CmpB', title: 'HRG', type:'company', categories:[
			 	 {id: 'PjtB1', title: 'Project B1', type:'project', categories: [], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
			  ]}
			]
		}
	$scope.events=[];
	$scope.eventSource=[$scope.events]
	//Sets details for event in focus
	$scope.eventfocus={"visible": false, "title":"", "start":"", "end":"", "comment":"", "startTMP":"", "endTMP":"", "error":false, "calEvent":{}}
	//Options, like if projects should be shown for mapped people only
	$scope.eventOPT={showmine:false, showid:"007", "months":[], "viewfrom":"", "viewto":""};
	$scope.clientprojects = $scope.get_tree();

	 $scope.daterangefilter = function (item) {
        return (item.start >= $scope.eventOPT.viewfrom && item.end <= $scope.eventOPT.viewto);
    };
	
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
			},
		viewRender: function(view, element) {		
			$scope.loadIntoView(view.start, view.end);
			}
     	}
    };
	//Set event detail window through -> eventfocus
	$scope.eventdetailsset = function(calEvent){
		var startVal=$scope.formatAddLeadingZero(calEvent.start.getHours()) + ":" + $scope.formatAddLeadingZero(calEvent.start.getMinutes());
		var endVal=$scope.formatAddLeadingZero(calEvent.end.getHours()) + ":" + $scope.formatAddLeadingZero(calEvent.end.getMinutes());		
		$scope.eventfocus={"visible": true, "title":calEvent.title, "start":calEvent.start, "end":calEvent.end, "comment":calEvent.comment, "startTMP":startVal, "endTMP":endVal, "calEvent":calEvent}		
		}
	//Save changes in entry details - check hours:minutes and save in OBJ
	$scope.eventdetailssave = function(){
		$scope.eventfocus.calEvent.comment = $scope.eventfocus.comment;
		if($scope.checktimeHoursMinutes($scope.eventfocus.startTMP) && $scope.checktimeHoursMinutes($scope.eventfocus.endTMP)) {
			var startArr=$scope.eventfocus.startTMP.split(":");
			var endArr=$scope.eventfocus.endTMP.split(":");
			if(!$scope.checktimeFromBiggerTo(startArr, endArr)){
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
	//Delete event from entry detail view, event is saved in eventfocus
	$scope.eventdetailsdelete = function() {
		$scope.deleteExistingMulti($scope.eventfocus.calEvent, $scope.events, "_id");
		$scope.cleareventfocus();
		}
	//Delete event from list, event as variable
	$scope.eventdetailsdeletedirect = function(evt) {
		$scope.deleteExistingMulti(evt, $scope.events, "_id");
		$scope.cleareventfocus();
		}	
	//clear the entry details window	
	$scope.cleareventfocus = function(){
		$scope.eventfocus={"visible": false, "title":"", "start":"", "end":"", "comment":"", "startTMP":"", "endTMP":"", "error":false, "calEvent":{}}
		}	
	//adds event, "eid" because "id" makes events double (i.e. resizing one resizes the other)	
   $scope.addEvent = function(date, eventoptions, showdetails) {
		var newEvent = {
			eid: eventoptions.id,
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
	//Filter -> check if field has people with same id	
	$scope.checkAssignedOnly = function(field){
		if($scope.eventOPT.showmine==false) return true
		else{
			if(field.people) {
				var checkPerson=field.people.some(function(entry) {
					return entry.id==$scope.eventOPT.showid;
					});
				return checkPerson;
				}
			}
		}
	$scope.calendarsave = function(){
		console.log($scope.events)
		}

	//************ POSSIBLE FACTORIES ******************//
	//Time functions
	//Check if input is in 24h-time-format e.g. 14:00
	$scope.checktimeHoursMinutes = function (input){
		return /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(input)
		}
	//Check if from-input array (hours, minutes) is bigger than end input array
	$scope.checktimeFromBiggerTo = function (inputFrom, inputTo) {
		if(inputFrom.length==2 && inputTo.length==2) {
			return (inputFrom[0]>inputTo[0] || (inputTo[0]==inputFrom[0] && inputFrom[1]>inputTo[1]))
			}
		else return false;
		}
	//Formats number with leading 0
	$scope.formatAddLeadingZero = function(input){
		return (input<10?'0':'')+input;
		}
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