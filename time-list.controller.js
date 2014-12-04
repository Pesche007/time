'use strict';

angular.module('time')
  .controller('TimeListCtrl', function ($scope, $filter, AppConfig) {
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
		$scope.tree_new.push({"cmpid":$scope.time_company.id, "cmptitle":$scope.time_company.title, "prjid":item.id, "prjtitle":item.title, "date":[],"time":[], "comment":""})
		}
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
		}
	//DUPLICAZE FORM TREE_INPUT		
	$scope.tree_input_tableCopy = function(obj, index){
		$scope.tree_new.splice(index, 0, angular.copy(obj)); //from http://stackoverflow.com/questions/19333023/ngmodel-reference-when-pushed-into-array
		}
	$scope.tree_input_tableRemove = function(index){
		$scope.tree_new.splice(index, 1);
		}	
			
  })