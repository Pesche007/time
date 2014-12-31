'use strict';

angular.module('time')
  .controller('TreeAdminCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	//API
	$scope.API={};
	$scope.API.get_tree = function () {
		var obj=[];
		for(var i=0;i<100;i++) {
			var tmp={id: 'CmpA'+i, title: 'Company A'+i, type:'company', children: [
					{id: 'PjtA1'+i, title: 'Project A1'+i, type:'project', children: [
						 {id: 'SPjtA11'+i, title: 'Sub-Project A11'+i, type:'project', children:[
						 	{id: 'SSPjtA11'+i, title: 'Sub-Sub-Project A111'+i, type:'project', children: [], people:[]}
						], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}, 
						 {id: 'SPjtA12'+i, title: 'Sub-Project A12'+i, type:'project', children:[
						 {id: 'SSPjtA12'+i, title: 'Sub-Sub-Project A112'+i, type:'project', children: [], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
						 ], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann", "rate": "000003"}]}
					 ]}
				]};
			obj.push(tmp)
			}
		return obj;
		}
	$scope.API.get_people = function(){
		return [{'id':'007', 'firstname':'Peter', 'lastname':'Windemann'}, {'id':'001alpha', 'firstname':'Bruno', 'lastname':'Kaiser'}, {'id':'123-KK', 'firstname':'Thomas', 'lastname':'Huber'}];	
		}
	$scope.API.get_rates = function() {
		var rates =  [
			{id: '000001', title: 'Junior Rate', rate:500},
			{id: '000002', title: 'Senior Rate', rate:1000},
			{id: '000003', title: 'Executive Rate', rate:2000},
		];
		return rates;
		}
	//Load config
	$scope.people=$scope.API.get_people();
	$scope.rates=$scope.API.get_rates();	
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
	$scope.treeOPT={addedit_show:false,delete_show:false,tmpobj:"",tmpindex:0,tmppeople:[],peopleselect:[],catName: "",treeitemDesc:"",treeAction:"",treePeopleView:0, treeRatesView:0, items:$scope.API.get_tree()};
	//Sets and Shows tree for selected company
	$scope.selectedComp={};
	$scope.show_tree = function(obj){
		$scope.tree_toggleBranchAll(obj);
		$scope.selectedComp=Array(obj);
		}
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
		angular.forEach(obj, function(value, key) {
			value.childrenVisible=dir;
			if(value.children) $scope.tree_toggleChildrenAll(dir, value.children)			
			});		
		}
	//Toggle expand/collapse one branch
	$scope.tree_toggleBranchAll = function(obj) {
		obj.childrenVisible=true;
		$scope.tree_toggleChildrenAll(true, obj.children)
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
	/************** RATES ****************/
	$scope.ratesTMP={'edit':false, 'tmpobj':{'id':'', 'title':'', 'rate':'', 'description':''}};
	$scope.add_rate=function(){
		$scope.rate_formreset();
		$scope.rate_toggle(1);
		}
	$scope.rate_save = function(){
		$scope.rates.push(angular.copy($scope.ratesTMP.tmpobj))
		$scope.rate_toggle(0);
		$scope.rate_formreset();
		}
	$scope.rate_cancel = function(){
		$scope.rate_toggle(0);
		$scope.rate_formreset();
		}
	$scope.rate_edit = function(rate){
		$scope.rate_toggle(1);
		$scope.ratesTMP.tmpobj=angular.copy(rate)
		}
	$scope.rate_delete = function(i){
		$scope.rates.splice(i, 1);
		$scope.rate_toggle(0);
		$scope.rate_formreset();		
		}				
	$scope.rate_toggle = function(dir){
		$scope.ratesTMP.edit=dir;
		}
	$scope.rate_formreset = function(){
		$scope.ratesTMP.tmpobj={id:'', 'title':'', rate:''};
		}				
  })