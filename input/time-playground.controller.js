'use strict';

angular.module('time')
  .controller('TimePlaygroundCtrl', function ($scope, cfg, WorkrecordService, alertsManager) {
	cfg.GENERAL.CURRENT_APP = 'time';

	$scope.opt={model:[{id:1, title:'Peter Windemann'}], source:[{id:1, title:'Peter Windemann'}, {id:2, title:'Bruno Kaiser'}, {id:3, title:'Marc Hofer'}, {id:4, title:'Thomas Huber'}]};
	$scope.meetingOPT={meeting:[{id:1, name:'1. Intro'}, {id:2, name:'2. Vorherige Sitzung'}, {id:3, name:'3. Strategie'}, {id:4, name:'4. Personal'}], structure:[{ name:'Agenda-Element', field: 'name', inputType:'text'}], colSel:{}}
	$scope.test = function(item){
		console.log(item)
	};
	$scope.meetingFunction = function(action, param, data){
		if(action===2){//Save new
			$scope.meetingOPT.meeting.push(param);
		}
		if(action===3){//Edit Save
			adressbookEditSave(param);
		}
		if(action===4){//Remove
			adressbookEditRemove(param);
		}	
		if(action===5){//Drop on adressbook
			console.log('id ' + param.drag.entity.id + ' dropped on id ' + param.drop.entity.id);
		}
		if(action===21){//Row Click
			$scope.meetingOPT.colSel=param.entity;	
		}
	};
 $scope.open = function($event) {
    $scope.status.opened = true;
  };
  $scope.status={};
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };  	
});
