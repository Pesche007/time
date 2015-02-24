'use strict';

angular.module('time')
  .controller('TreeInputCtrl', function ($scope, $filter, $http, $log, cfg) {
	cfg.GENERAL.CURRENT_APP = 'time';
	
	//API
	$scope.API={};

	$scope.treeOPT=
	{
		addeditShow: false, 
		deleteShow: false, 
		tmpobj: '', 
		tmpindex: 0, 
		tmppeople: [], 
		peopleselect: [], 
		catName: '', 
		treeitemDesc: '', 
		treeAction: '', 
		treePeopleView: 0, 
		items: {}
	};

	$scope.API.getTree = function() {
		$log.log('TreeInputCtrl.getTree() calling get(' + cfg.wtt.SVC_URI + ')');
		$http.get(cfg.wtt.SVC_URI)
		.success(function (data, status) {
			$log.log('data=<' + angular.toJson(data.wttData, 4) + '>');
			$scope.treeOPT.items = data.wttData;
		})
		.error(function(data, status, headers, config) {
			$log.log('ERROR: TreeInputCtrl.getTree() returned with status ' + status);
		});
	}; 
	$scope.API.getTree();
		/*var _listUri = '/api/wtt/gettree';
		$http.get(_listUri)
		.success(function(data, status) {
			$log.log('time-tree-input.controller: **** SUCCESS: GET(' + _listUri + ') returns with ' + status);
	    	// $log.log('data=<' + JSON.stringify(data) + '>');
	    	$scope.treeOPT.items = data;
		})
		.error(function(data, status) {
	  		// called asynchronously if an error occurs or server returns response with an error status.
	    	$log.log('time-tree-input.controller: **** ERROR:  GET(' + _listUri + ') returns with ' + status);
	    	// $log.log('data=<' + JSON.stringify(data) + '>');
	  	});*/
		// $scope.treeOPT.items = [{ id: 'CmpA', title: 'UBS', type:'company', categories: [{ id: 'PjtA1', title: 'Project A1', type:'project', categories: [{ id: 'SPjtA11', title: 'Sub-Project A11', type:'project', 	categories: [	{ id: 'SSPjtA11', title: 'Sub-Sub-Project A111', type:'project', categories: [], people:[] 	}], people: [{ id: '007', firstname: 'Peter', lastname: 'Windemann' }]}, { id: 'SPjtA12', title: 'Sub-Project A12', type:'project', categories: [{ id: 'SSPjtA12', title: 'Sub-Sub-Project A112', type:'project', categories: [], people:[ 	{ id: '007', firstname: 'Peter', lastname: 'Windemann' }]} ],  people: [ 	{ id: '007', firstname: 'Peter', lastname: 'Windemann' } ]}]},]},{ id: 'CmpB', title: 'HRG', type:'company', categories: [{ id: 'PjtB1', title: 'Project B1', type:'project', 	categories: [], people: [ 	{ id: '007', firstname: 'Peter', lastname: 'Windemann'}	]}]}];
	//};

	//get time entries for a specific date 
	$scope.API.getentries = function(){
		return [ {   'id': 'SPjtA11',    'title': 'Sub-Project A11',    'time': '1000-1200',    'comment': 'Test1',    'level': 2,    'path': [
	      {        'id': 'CmpA',        'title': 'Company A'      },      {        'id': 'PjtA1',        'title': 'Project A1'      }    ]  },
		  {    'id': 'SPjtA12',    'title': 'Sub-Project A12',    'time': '1100-1200',    'comment': 'Test2',    'level': 2,    'path': [
	     {    'id': 'CmpA',       'title': 'Company A'    },   {     'id': 'PjtA1',     'title': 'Project A1'  } ] },
		  {  'id': 'SSPjtA12',    'title': 'Sub-Sub-Project A112',    'time': '1200-1300',    'comment': 'Test3',    'level': 3,    'path': [      {
        'id': 'CmpA',        'title': 'Company A'      },      {        'id': 'PjtA1',        'title': 'Project A1'      },
      {        'id': 'SPjtA12',        'title': 'Sub-Project A12'      }    ]  },
	    {    'id': 'PjtB1',    'title': 'Project B1',    'time': '2.5',    'comment': 'Test4',    'level': 1,    'path': [      {
        'id': 'CmpB',        'title': 'Company B'      }    ]  }];
		};
	$scope.API.getTreetableinput = function (){
		return $scope.treeOPT.items;
		};

	//Datepoicker
	$scope.today = function() {
		$scope.dt = $filter('date')(new Date(), 'yyyy-MM-dd');
		};
	$scope.today();	
	$scope.opened=[];
	$scope.open = function($event, openid) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened[openid] = true;
		};
	//************************************** Tree Input**************************************
	$scope.API.getTree();
	$scope.treeTable = [];
	$scope.treeTablepplid='007';
	$scope.treeGenerateTable = function(obj, objdetails, level) {	
		if(obj==='root') {
			$scope.treeTable = [];
			obj=$scope.API.getTreetableinput();
			objdetails=[];
			level=0;
			}
		angular.forEach(obj, function(value) {
			if(value.type==='company') {
				level=0;
				objdetails=[];
				}
			objdetails[level]={id:value.id, title:value.title};
			if(value.people) {
				angular.forEach(value.people, function(val) {
					if(val.id===$scope.treeTablepplid) {
						var objTMP=[];	
						for(var i=0;i<level;i++){
							objTMP.push(objdetails[i]);
							}					
						$scope.treeTable.push({'id':value.id, 'title':value.title, 'time':'', 'comment':'', 'level':level, 'path':objTMP});
						}
					});
				}
			if(value.children) {
				$scope.treeGenerateTable(value.children, objdetails, level+1);
				}
			});
		};
	//Copy element
	$scope.treeInputTableCopy = function(obj, index){
		$scope.treeTable.splice(index, 0, angular.copy(obj)); //from http://stackoverflow.com/questions/19333023/ngmodel-reference-when-pushed-into-array
		$scope.addToLog('copy row', $scope.treeTable);
		};
	//remove element
	$scope.treeInputTableRemove = function(index){
		$scope.treeTable.splice(index, 1);
		$scope.addToLog('delete row', $scope.treeTable);
		};
	//Load new date
	$scope.loadDate = function(dir){
		var currentdate = new Date($scope.dt);
		if(dir===1) {
			$scope.dt=currentdate.setDate(currentdate.getDate() + 1);			
			}
		else {						
			$scope.dt=currentdate.setDate(currentdate.getDate() - 1);
			}
		$scope.treeTable = $scope.API.getentries($scope.dt);
		};
	$scope.treeGenerateTable('root', '');	
	//Action log
	$scope.actionlog=[];
	$scope.compareEquals = function(obj) {
		return angular.equals(obj, $scope.treeTable);
		};
	$scope.addToLog = function(action, obj){
		$scope.actionlog.push({'time':new Date(), 'action':action, 'obj':angular.copy(obj)});
		};
	$scope.actionlogLoad = function(obj){
		$scope.treeTable=obj.obj;
		};
	$scope.actionlogRestore = function(obj){
		$scope.treeTable=obj.obj;
		$scope.actionlogReset();
		$scope.isCollapsed=true;
		};
	$scope.actionlogReset = function(){
		$scope.actionlog.splice(1, Number.MAX_VALUE);
		};
	$scope.actionlogUpdatefield = function(action, obj){
		if(obj!==undefined) {
			obj=obj==='' ? 'delete' : obj;
			$scope.addToLog('edit ' + action + ' -> ' + obj, $scope.treeTable);
			}
		};
	$scope.addToLog('init', $scope.treeTable);
	$scope.isCollapsed = true;
  });