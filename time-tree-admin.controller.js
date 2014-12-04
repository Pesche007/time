'use strict';

angular.module('time')
  .controller('TreeAdminCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	
	//API
	$scope.get_tree = function () {
		return [{id: 'CmpA', title: 'Company A', type:'company', children: [
					{id: 'PjtA1', title: 'Project A1', type:'project', children: [
						 {id: 'SPjtA11', title: 'Sub-Project A11', type:'project', children:[
						 	{id: 'SSPjtA11', title: 'Sub-Sub-Project A111', type:'project', children: [], people:[]}
						], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}, 
						 {id: 'SPjtA12', title: 'Sub-Project A12', type:'project', children:[
						 {id: 'SSPjtA12', title: 'Sub-Sub-Project A112', type:'project', children: [], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
						 ], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
					 ]},
				]},
			  {id: 'CmpB', title: 'Company B', type:'company', children:[
			 	 {id: 'PjtB1', title: 'Project B1', type:'project', children: [], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
			  ]}
			]
		}

	$scope.get_people = function(){
		return [{'id':'007', 'firstname':'Peter', 'lastname':'Windemann'}, {'id':'001alpha', 'firstname':'Bruno', 'lastname':'Kaiser'}, {'id':'123-KK', 'firstname':'Thomas', 'lastname':'Huber'}];	
		}

	//Load config
	$scope.people=$scope.get_people();
			
	//************************************** Select Multiple **************************************
	$scope.removeMultiSinglePerson = function(data, model){
		$scope.deleteExistingMulti(data, model, "id");
		}
	//delete element from array of objects
	$scope.deleteExistingMulti = function(data, model, selector) {
		for (var i = 0, len = model.length; i < len; i++) {
			if (model[i][selector]== data[selector]) {
				model.splice(i, 1);
				break;
				}
			}	
		}
	//check if element exists in array of objects
	$scope.checkExistingMulti = function(data, model) {
		var checkVar=true;
		for (var i = 0, len = model.length; i < len; i++) {
			if (model[i]["id"]== data.id) {
				checkVar=false;
				break;
				}
			}	
		return checkVar; 		
		}
	$scope.updatePeople = function (data, model, selector){
		if($scope.checkExistingMulti(data, model)) model.push(data)
		$scope.treeOPT[selector]=[]
		}	
	$scope.selectMultiPerson = function(data, model){
		if($scope.checkExistingMulti(data, model)) model.push(data)
		}		
	$scope.logMultiPerson = function(){
		console.log($scope.MultiplePeople)
		}
					
	//************************************** Tree **************************************
	//Options for tree - idea: save all actions and objects handleded as tmp saves and then act upon them (e.g. create subtree -> stores action "add", then enter name and save -> tmp action "add" execute
	$scope.treeOPT={addedit_show:false, delete_show:false, tmpobj: "", tmpindex:0, tmppeople:[], peopleselect:[], catName: "", treeitemDesc:"", treeAction:"", treePeopleView:0, items:$scope.get_tree()}
	//remove all input modal divs
	$scope.tree_removeAllShow = function(){
		$scope.treeOPT.addedit_show=false;
		$scope.treeOPT.delete_show=false;
		$scope.treeOPT.assign_person_show=false;
		}
	//show manage/add/edit modal div -> show=action
	$scope.tree_show = function(show){
		$scope.treeOPT[show]=true;
		}
	//add selected object (obj) and index in array (i) to tmp
	$scope.tree_addtoTMP = function(obj, i){
		$scope.treeOPT.tmpobj=obj;
		$scope.treeOPT.tmpindex=i;		
		}
	//save selected action to tmp for further use
	$scope.set_treeaction = function(action){
		$scope.treeOPT.treeAction=action;
		}
	//set description on modal div to txt
	$scope.set_treeDescription = function(txt){
		$scope.treeOPT.treeitemDesc=txt;
		}
	//set value of input field of modal edit div
	$scope.set_modalInput = function(txt) {
		$scope.treeOPT.catName=txt;
		}
	//Open/hide tree
	$scope.tree_toggleChildren = function(obj) {		
		obj.childrenVisible = !obj.childrenVisible;
		}
	//Toggle expand/collapse all
	$scope.tree_toggleChildrenAll = function(dir, obj) {
		if(obj==="root") obj=$scope.treeOPT.items
		angular.forEach(obj, function(value, key) {
			value.childrenVisible=dir;
			if(value.children) $scope.tree_toggleChildrenAll(dir, value.children)			
			});		
		}
	//through cleanup off all tmp saves
	$scope.tree_cleartmp = function(){
		$scope.tree_removeAllShow();
		$scope.treeOPT.tmpobj="";
		$scope.treeOPT.tmpindex=0;
		$scope.treeOPT.catName="";
		$scope.treeOPT.treeitemDesc="";
		$scope.treeOPT.treeAction="";
		$scope.treeOPT.tmppeople=[];
		}	
	//Record tree action 
	$scope.tree_action = function(obj, index, action){
		$scope.tree_removeAllShow();
		$scope.tree_addtoTMP(obj, index);
		$scope.set_treeaction(action);
		if(action==="add") {
			$scope.tree_show("addedit_show")
			var txt=obj.title!==undefined ? "Add new element to " +obj.title : "Add new element to root"
			}			
		else if(action==="assign_person") {
			$scope.tree_show("assign_person_show")
			var txt="Select person to assign to "+obj.title;			
			//Assign values but don't link $scope.treeOPT.tmppeople=obj => links it to scope
			angular.forEach(obj.people, function(item) {
				$scope.treeOPT.tmppeople.push(item)		
				})
			}
		else if(action==="edit") {
			$scope.tree_show("addedit_show")
			var txt="Change name for element "+obj.title;
			$scope.set_modalInput(obj.title)
			}
		else if(action==="delete") {
			$scope.tree_show("delete_show")
			var subtreeTXT=obj.children[index].children.length?" and all its subtrees":"";
			var txt="Confirm: Delete " + obj.children[index].title + subtreeTXT + "?";			
			}
		else {
			//proper error handling
			return false;
			}			
		$scope.set_treeDescription(txt);
		}
	//Executes saved tmp action on click on "Save" button
	$scope.tree_actionExec = function() {
		if($scope.treeOPT.treeAction==="add") {
			if($scope.treeOPT.tmpobj==="root") $scope.treeOPT.items.unshift({"title": $scope.treeOPT.catName, "type":"company", "childrenVisible": true, children:[]});
			else $scope.treeOPT.tmpobj.children.unshift({"title": $scope.treeOPT.catName, "type":"project", "childrenVisible": true, children:[]});	
			}
		else if($scope.treeOPT.treeAction==="assign_person") {
			$scope.treeOPT.tmpobj["people"]=$scope.treeOPT.tmppeople
			}
		else if($scope.treeOPT.treeAction==="edit") {
			$scope.treeOPT.tmpobj.title=$scope.treeOPT.catName;
			}
		else if($scope.treeOPT.treeAction==="delete") {
			$scope.treeOPT.tmpobj.children.splice($scope.treeOPT.tmpindex, 1);
			}
		else {
			//proper error handling
			return false;
			}
		$scope.tree_cleartmp();
		}
  })