'use strict';

angular.module('time')
  .controller('TimeListCtrl', function ($scope, $filter, AppConfig) {
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
		$scope.treeNew.push({'cmpid':$scope.timeCompany.id, 'cmptitle':$scope.timeCompany.title, 'prjid':item.id, 'prjtitle':item.title, 'date':'','time':'', 'comment':''});
		};
	//Datepicker
	$scope.opened=[];
	$scope.open = function($event, openid) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened[openid] = true;
		};	
	$scope.formatedate = function (obj){
		//Callend whenever a date is selected. Because the date is stored unformatted, when performing a row-copy, the datepicker date gets rewritten with unformatted date. 
		obj.date = $filter('date')(obj.date, 'dd.MM.yyyy');
		};
	//DUPLICAZE FORM TREE_INPUT		
	$scope.treeInputTableCopy = function(obj, index){
		$scope.treeNew.splice(index, 0, angular.copy(obj)); //from http://stackoverflow.com/questions/19333023/ngmodel-reference-when-pushed-into-array
		};
	$scope.treeInputTableRemove = function(index){
		$scope.treeNew.splice(index, 1);
		};				
  });