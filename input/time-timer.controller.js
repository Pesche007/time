'use strict';

angular.module('time')
  .controller('TimeTimerCtrl', function ($scope, $filter, $interval, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	
	$scope.getTree = function () {
		return [{id: 'CmpA', title: 'Company A', type:'company', categories: [
					{id: 'PjtA1', title: 'Project A1', type:'project', categories: [
						 {id: 'SPjtA11', title: 'Sub-Project A11', type:'project', categories:[
						 	{id: 'SSPjtA11', title: 'Sub-Sub-Project A111', type:'project', categories: [], people:[]}
						], people:[ {'id': '007', 'firstname': 'Peter', 'lastname': 'Windemann'}]}, 
						 {id: 'SPjtA12', title: 'Sub-Project A12', type:'project', categories:[
						 {id: 'SSPjtA12', title: 'Sub-Sub-Project A112', type:'project', categories: [], people:[ {'id': '007', 'firstname': 'Peter', 'lastname': 'Windemann'}]}
						 ], people:[ {'id': '007', 'firstname': 'Peter', 'lastname': 'Windemann'}]}
					 ]},
				]},
			  {id: 'CmpB', title: 'Company B', type:'company', categories:[
			 	 {id: 'PjtB1', title: 'Project B1', type:'project', categories: [], people:[ {'id': '007', 'firstname': 'Peter', 'lastname': 'Windemann'}]}
			  ]}
			];
		};
	$scope.treeOPT={addeditShow:false, deleteShow:false, tmpobj: '', tmpindex:0, tmppeople:[], peopleselect:[], catName: '', treeitemDesc:'', treeAction:'', treePeopleView:0, items:$scope.getTree()};
	$scope.treeCompany=[];	
	$scope.treeNew=[];	
	$scope.timeUpdate = function(item){
		$scope.timeCompany=item;
		$scope.treeTable = item.categories;
		};
	$scope.treeNewentry = function (item) {
		$scope.treeNew.push(
			{'cmpid':$scope.timeCompany.id, 'cmptitle':$scope.timeCompany.title, 'prjid':item.id, 'prjtitle':item.title, 'timer':{'start':'','stop':'', 'run':''}, 'state':0, 
			'date': $filter('date')(new Date(), 'dd.MM.yyyy'), 'time':'', 'comment':''}
			);
		};
	$scope.timeTimerOPT={'timeMultiple':0, 'timeAutosave':0, 'showmine':0, 'showid':'007'};
	//Callend whenever a date is selected. Because the date is stored unformatted, when performing a row-copy, the datepicker date gets rewritten with unformatted date. 		
	$scope.formatedate = function (obj){
		obj.date = $filter('date')(obj.date, 'dd.MM.yyyy');
		};	
	//Timer		
	$scope.timeTimerstart = function(obj){
		var newDate=new Date();		
		if($scope.timeTimerOPT.timeMultiple===0) {
			angular.forEach($scope.treeNew, function(value) {
				if(value.state===1) {
					$scope.timeTimerpause(value);
					}
				});
			}		
		if(obj.state===0) {
			obj.timer.start = newDate;
			obj.timer.stop=newDate;
			obj.timer.run=newDate;			
			}
		else {
			var newStart = new Date(Math.abs(newDate - (new Date(obj.timer.stop)-new Date(obj.timer.start))));
			obj.timer.start=newStart;
			obj.timer.stop='';
			obj.timer.run=newDate;									
			}
		obj.state=1;
		obj.interval = $interval(function(){
			obj.timer.run=new Date();
			},1000);
		};
	$scope.timeTimerpause = function(obj){
		obj.timer.stop=new Date();
		obj.timer.run='';
		$interval.cancel(obj.interval);
		obj.state=2;
		};
	$scope.timeTimerstop = function(obj){
		obj.timer.stop=new Date();
		obj.timer.run='';
		$interval.cancel(obj.interval);
		obj.state=3;
		obj.time=$scope.msToHoursDecimal(Math.abs(obj.timer.stop - obj.timer.start));
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
			diff = Math.abs(obj.timer.run - obj.timer.start);
			sumtime=parseInt(sumtime+diff);						
			}
		else {
			diff = Math.abs(new Date(obj.timer.stop) - new Date(obj.timer.start));
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
	//DUPLICATE FROM Calendar
	$scope.checkAssignedOnly = function(field){
		if($scope.timeTimerOPT.showmine===0) {
			return true;
			}
		else{
			if(field.people) {
				var checkPerson=field.people.some(function(entry) {
					return entry.id===$scope.timeTimerOPT.showid;
					});
				return checkPerson;
				}
			}
		};
	//AUTOSAVE AUTOLOAD
    angular.element(document).ready(function () {
		if($scope.timeTimerOPT.timeAutosave) {
			//AutoSave
			$scope.autosave = $interval(function(){
				localStorage.setItem('TimeTimerCtrl', JSON.stringify($scope.treeNew));
				console.log('autosave');
				},10000);
			//AutoLoad
			$scope.autoload = function() {
				$scope.autosaveitem = localStorage.getItem('TimeTimerCtrl');
				if ($scope.autosaveitem !== null) {			
					$scope.treeNew=JSON.parse($scope.autosaveitem);
					localStorage.removeItem('TimeTimerCtrl');
					console.log('autoload');
					angular.forEach($scope.treeNew, function(value) {
						if(value.state===1) {
							$scope.timeTimerpause(value);
							}
						});			
					}				
				};
			$scope.autoload();					
		}
    });	
  });