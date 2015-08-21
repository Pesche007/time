'use strict';

angular.module('time')
  .controller('TimePlaygroundCtrl', function ($scope, $timeout, cfg, WorkrecordService, alertsManager) {
	cfg.GENERAL.CURRENT_APP = 'time';

	$scope.opt={model:[{id:1, title:'Peter Windemann'}], source:[{id:1, title:'Peter Windemann'}, {id:2, title:'Bruno Kaiser'}, {id:3, title:'Marc Hofer'}, {id:4, title:'Thomas Huber'}]};
	$scope.meetingTypes={types:[{id:1, name:'VR'}, {id:2, name:'GL'}, {id:3, name:'Marketing'}], structure:[{ name:'Meeting-Typ', field: 'name', inputType:'text'}], colSel:{}};	
	$scope.test = function(item){
		console.log(item)
	};
	$scope.meetingTypesFunction = function(action, param, data){
		if(action===21){//Row Click		
			$scope.meetingTypes.colSel={};
			if(param.entity.id===1)	{
				$scope.meetingOPT={meeting:[{id:1, name:'10.02.15'}, {id:2, name:'14.04.15'}, {id:3, name:'12.06.15'}], structure:[{ name:'Meetings', field: 'name', inputType:'text'}], colSel:{}}
			}
			if(param.entity.id===2)	{
				$scope.meetingOPT={meeting:[{id:1, name:'09.02.15'}, {id:2, name:'18.03.15'}, {id:3, name:'18.05.15'}], structure:[{ name:'Meetings', field: 'name', inputType:'text'}], colSel:{}}
			}
			if(param.entity.id===3)	{
				$scope.meetingOPT={meeting:[{id:1, name:'04.02.15'}, {id:2, name:'06.04.15'}, {id:3, name:'11.05.15'}], structure:[{ name:'Meetings', field: 'name', inputType:'text'}], colSel:{}}				
			}
			$timeout(function () {$scope.meetingTypes.colSel=param.entity;}, 100);
		}		
	};
	$scope.meetingFunction = function(action, param, data){
		if(action===21){//Row Click
			$scope.meetingOPT.colSel={};			
			if($scope.meetingTypes.colSel.id===1)	{
				$scope.meetingDetails={items:[{id:1, name:'1. Intro'}, {id:2, name:'2. Letzte Sitzung'}, {id:3, name:'3. Finanzen'}, {id:4, name:'4. Personal'}, {id:5, name:'5. Varia'}]};
			}
			if($scope.meetingTypes.colSel.id===2)	{
				$scope.meetingDetails={items:[{id:1, name:'1. Intro'}, {id:2, name:'2. Letzte Sitzung'}, {id:3, name:'3. Projekt K'}, {id:4, name:'4. Zeitplanung'}, {id:5, name:'5. Varia'}]};		
			}
			if($scope.meetingTypes.colSel.id===3)	{
				$scope.meetingDetails={items:[{id:1, name:'1. Intro'}, {id:2, name:'2. Agenda'}, {id:3, name:'3. Beschlüsse'}, {id:4, name:'4. Projekte'}, {id:5, name:'5. Varia'}]};		
			}
			$scope.meetingDetails.folderRoot='/Sites/test/documentLibrary/Meetings/'+$scope.meetingTypes.colSel.name + '/' + param.entity.name;
			$scope.meetingDetails.folder = $scope.meetingDetails.folderRoot + '/' + $scope.meetingDetails.items[0].name;
			$timeout(function () {$scope.meetingOPT.colSel=param.entity;}, 100);			
		}
	};
	$scope.meetingSource = function(tab){
		$scope.meetingDetails.folder = $scope.meetingDetails.folderRoot + '/' + tab.name;
		tab.loaded=true;
	};
});
