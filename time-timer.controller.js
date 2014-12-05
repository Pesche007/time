'use strict';

angular.module('time')
  .controller('TimeTimerCtrl', function ($scope, $filter, $interval, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	
	$scope.get_tree = function () {
		return [{id: 'CmpA', title: 'Company A', type:'company', categories: [
					{id: 'PjtA1', title: 'Project A1', type:'project', categories: [
						 {id: 'SPjtA11', title: 'Sub-Project A11', type:'project', categories:[
						 	{id: 'SSPjtA11', title: 'Sub-Sub-Project A111', type:'project', categories: [], people:[]}
						], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}, 
						 {id: 'SPjtA12', title: 'Sub-Project A12', type:'project', categories:[
						 {id: 'SSPjtA12', title: 'Sub-Sub-Project A112', type:'project', categories: [], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
						 ], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
					 ]},
				]},
			  {id: 'CmpB', title: 'Company B', type:'company', categories:[
			 	 {id: 'PjtB1', title: 'Project B1', type:'project', categories: [], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
			  ]}
			]
		}
	$scope.treeOPT={addedit_show:false, delete_show:false, tmpobj: "", tmpindex:0, tmppeople:[], peopleselect:[], catName: "", treeitemDesc:"", treeAction:"", treePeopleView:0, items:$scope.get_tree()}
	$scope.tree_company=[];
	$scope.tree_new=[];
	$scope.time_update = function(item){
		$scope.time_company=item
		$scope.tree_table = item.categories
		}
	$scope.tree_newentry = function (item) {
		$scope.tree_new.push(
			{"cmpid":$scope.time_company.id, "cmptitle":$scope.time_company.title, "prjid":item.id, "prjtitle":item.title, "timer":{"start":"","stop":"", "run":""}, "state":0, "time":"", "comment":""}
			)
		}
	//Allow multiple time to run at once
	$scope.time_multiple=0;
	//Callend whenever a date is selected. Because the date is stored unformatted, when performing a row-copy, the datepicker date gets rewritten with unformatted date. 		
	$scope.formatedate = function (obj){
		obj.date = $filter('date')(obj.date, 'dd.MM.yyyy');
		}		
	//Timer		
	$scope.time_timerstart = function(obj){
		var newDate=new Date();		
		if($scope.time_multiple==false) {
			angular.forEach($scope.tree_new, function(value, key) {
				if(value.state==1) {
					$scope.time_timerpause(value);
					}
				});
			}		
		if(obj.state==0) {
			obj.timer["start"] = newDate;
			obj.timer["stop"]=newDate;
			obj.timer["run"]=newDate;			
			}
		else {
			var newStart = new Date(Math.abs(newDate - (obj.timer["stop"]-obj.timer["start"])))
			obj.timer["start"]=newStart;
			obj.timer["stop"]="";
			obj.timer["run"]=newDate;									
			}
		obj.state=1;
		obj.interval = $interval(function(){
			obj.timer["run"]=new Date();
			},1000);
		}
	$scope.time_timerpause = function(obj){
		obj.timer["stop"]=new Date();
		obj.timer["run"]="";
		$interval.cancel(obj.interval);
		obj.state=2;
		}		
	$scope.time_timerstop = function(obj){
		obj.timer["stop"]=new Date();
		obj.timer["run"]="";
		$interval.cancel(obj.interval);
		obj.state=3;
		obj.time=$scope.msToHoursDecimal(Math.abs(obj.timer["stop"] - obj.timer["start"]));
		}
	//Trigger States of start/pause/stop buttons				
	$scope.checktimer = function(obj, act){
		if(obj.state==0) {
			if(act=="start") return false;
			if(act=="stop" || act=="pause") return true;
			}
		else if(obj.state==1) {
			if(act=="start") return true;
			if(act=="stop" || act=="pause") return false;			}		
		else if(obj.state==2) {
			if(act=="start" || act=="stop") return false;
			if(act=="pause") return true;		
			}		
		else if(obj.state==3) {
			return true;			
			}					
		}
	//Display difference in time
	$scope.calctime = function(obj){
		var sumtime=0;
		if(obj.timer["run"]!="") {
			var diff = Math.abs(obj.timer["run"] - obj.timer["start"]);
			var sumtime=parseInt(sumtime+diff);						
			}
		else {
			var diff = Math.abs(obj.timer["stop"] - obj.timer["start"]);
			var sumtime=parseInt(sumtime+diff);				
			}		
		return $scope.msToTime(sumtime);
		}
	//Format miliseconds to time
	$scope.msToTime = function(s) {
		function addZ(n) {
			return (n<10? '0':'') + n;
			}		
		var timeArr=$scope.msToHourMinSec(s);
		return addZ(timeArr[0]) + ':' + addZ(timeArr[1]) + ':' + addZ(timeArr[2]);		
	}
	//Fromat miliseconds to hours.minutes
	$scope.msToHoursDecimal	= function (s){
		var timeArr=$scope.msToHourMinSec(s);
		var dechrs=Math.round(((timeArr[1]*60 + timeArr[2])/3600)*100)/100;
		return timeArr[0]+dechrs;
		}
	//Get hours, minutes and seconds form miliseconds
	$scope.msToHourMinSec = function (s) {
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;	
		return Array(hrs, mins, secs);		
		}		
  })