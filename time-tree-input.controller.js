'use strict';

angular.module('time')
  .controller('TreeInputCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	
	//API
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
	$scope.get_treetableinput = function (){
		return $scope.treeOPT.items;
		}

	//************************************** Tree Input**************************************
	$scope.treeOPT={addedit_show:false, delete_show:false, tmpobj: "", tmpindex:0, tmppeople:[], peopleselect:[], catName: "", treeitemDesc:"", treeAction:"", treePeopleView:0, items:$scope.get_tree()}
	$scope.tree_table = [];
	$scope.tree_tablepplid="007";
	$scope.tree_generateTable = function(obj, objdetails, level) {	
		if(obj==="root") {
			$scope.tree_table = [];
			obj=$scope.get_treetableinput();
			objdetails=[];
			level=0;
			}
		angular.forEach(obj, function(value, key) {
			if(value.type=="company") {
				level=0;
				objdetails=[];
				}
			objdetails[level]={id:value.id, title:value.title};
			if(value.people) {
				angular.forEach(value.people, function(val, k) {
					if(val.id==$scope.tree_tablepplid) {
						var objTMP=[];	
						for(var i=0;i<level;i++){
							objTMP.push(objdetails[i]);
							}					
						$scope.tree_table.push({"id":value.id, "title":value.title, "time":"", "comment":"", "level":level, "path":objTMP})					
						}
					})
				}
			if(value.categories) {
				$scope.tree_generateTable(value.categories, objdetails, level+1)						
				}
			})
		}
	$scope.tree_input_tableCopy = function(obj, index){
		$scope.tree_table.splice(index, 0, angular.copy(obj)); //from http://stackoverflow.com/questions/19333023/ngmodel-reference-when-pushed-into-array
		}
	$scope.tree_input_tableRemove = function(index){
		$scope.tree_table.splice(index, 1);
		}
  })