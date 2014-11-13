'use strict';

angular.module('time')
  .controller('TreeCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	
	//API
	$scope.get_people = function(){
		return [{'id':'007', 'firstname':'Peter', 'lastname':'Windemann'}, {'id':'001alpha', 'firstname':'Bruno', 'lastname':'Kaiser'}, {'id':'123-KK', 'firstname':'Thomas', 'lastname':'Huber'}];	
		}
	
	$scope.get_client = function (){
		return [{'companyname':'UBS AG', 'id':'007'}, {'companyname':'Credit Suisse AG', 'id':'001alpha'}, {'companyname':'Julius Bär AG', 'id':'123-KK'}];		
		}
	
	$scope.get_tree = function () {
		return [{title: 'Computers', categories: [
					{title: 'Laptops', categories: [
						 {title: 'Ultrabooks', categories:[]}, {title: 'Macbooks', categories:[]}
					 ]},
				]},
			  {title: 'Printers', categories:[], people:[ {"id": "007", "firstname": "Peter", "lastname": "Windemann"}]}
			]
		}
	//Load config
	$scope.people=$scope.get_people();	
	$scope.client =$scope.get_client();
	
	$scope.opened=[];
	$scope.open = function($event, openid) {
    	$event.preventDefault();
	    $event.stopPropagation();
	    $scope.opened[openid] = true;
	  };


	//*********************** Table ********************	
	$scope.getConfig=function(){
		var rowConfig = [
			{"title":"Date", "type":"date", "value":""},
			{"title":"Hours", "type":"time", "value":""},
			{"title":"Person", "type":"peopleselect", "value":""},
			{"title":"Comment", "type":"text", "value":""},
			{"title":"Test", "type":"text", "value":""}
			]
		return rowConfig;		
		}
	$scope.tableValues={"rows":[]};
	$scope.tableValues.rows.push($scope.getConfig())
	$scope.logRow=function(){
		console.log($scope.tableValues)
		}
	$scope.addRow=function(){
		$scope.tableValues.rows.push($scope.getConfig())
		}
	$scope.tableRemove=function(row){
		delete $scope.tableValues.rows[row]
		}
	$scope.tableCopy=function(row){
		var rowConfig=$scope.getConfig();
		for (var i = 0, len = rowConfig.length; i < len; i++) {
				rowConfig[i].value=$scope.tableValues.rows[row][i].value;
			}			
		$scope.tableValues.rows.push(rowConfig)
		}
	//************************************** Single Select ****************************************
	$scope.selectPerson = function(data, model){
		scopeModel=string2model(model);
		scopeModel=data;
		}
	$scope.removePerson = function() {$scope.PeopleSelect=undefined}	

	$scope.logPerson = function(){
		console.log($scope.PeopleSelect)
		}
	//************************************** Select Multiple **************************************
	//$scope.MultiplePeople=[]
	//$scope.removeMultiPerson = function() {$scope.MultiplePeople=[]}
	$scope.removeMultiSinglePerson = function(data, model){
		$scope.deleteExistingMulti(data, model);
		}
	//delete element from array of objects
	$scope.deleteExistingMulti = function(data, model) {
		for (var i = 0, len = model.length; i < len; i++) {
			if (model[i]["id"]== data.id) {
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
	$scope.treeOPT={addedit_show:false, delete_show:false, tmpobj: "", tmpindex:0, tmppeople:[], peopleselect:[], catName: "", treeitemDesc:"", treeAction:"", items:$scope.get_tree()}
	
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
			var subtreeTXT=obj.categories[index].categories.length?" and all its subtrees":"";
			var txt="Confirm: Delete " + obj.categories[index].title + subtreeTXT + "?";			
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
			if($scope.treeOPT.tmpobj==="root") $scope.treeOPT.categories.unshift({title: $scope.treeOPT.catName, categories:[]});
			else $scope.treeOPT.tmpobj.categories.unshift({title: $scope.treeOPT.catName, categories:[]});	
			}
		else if($scope.treeOPT.treeAction==="assign_person") {
			$scope.treeOPT.tmpobj["people"]=$scope.treeOPT.tmppeople
			}
		else if($scope.treeOPT.treeAction==="edit") {
			$scope.treeOPT.tmpobj.title=$scope.treeOPT.catName;
			}
		else if($scope.treeOPT.treeAction==="delete") {
			$scope.treeOPT.tmpobj.categories.splice($scope.treeOPT.tmpindex, 1);
			}
		else {
			//proper error handling
			return false;
			}
		$scope.tree_cleartmp();
		}

	//*************************************** Dependency Select *****************************
	var option1Options = ["UBS AG", "Credit Suisse AG", "Julius Bär AG"];
	var option2Options = [
		["Projekt UBS 1","Projekt UBS 2","Projekt UBS 3"], 
		["Projekt Credit Suisse 1","Projekt Credit Suisse 2","Projekt Credit Suisse 3"], 
		["Projekt Julius Bär 1","Projekt Julius Bär 1","Projekt Julius Bär 1"]
		];
	$scope.options1 = option1Options;
	$scope.options2 = []; 
	$scope.getOptions2 = function(){
		var key = $scope.options1.indexOf($scope.option1);
		var myNewOptions = option2Options[key];
		$scope.options2 = myNewOptions;
		};
		
	$scope.ClientProjects=[
		{
				"name":"UBS AG", 
				"id":"1001", 
				"projects":[
					{
						"name":"Project UBS AG 1", 
						"id":"3001", 
						"subprojects":[
							{
								"name":"Sub-Project UBS AG 1", 
								"id":"5001"
							},
							{
								"name":"Sub-Project UBS AG 2", 
								"id":"5001a"
							}
						]
					}
				]
			},
		{
				"name":"Credit Suisse AG", 
				"id":"1002", 
				"projects":[
					{
						"name":"Credit Suisse AG 1", 
						"id":"3002", 
						"subprojects":[
							{
								"name":"Sub-Project Credit Suisse AG 1", 
								"id":"5002"
							},
							{
								"name":"Sub-Project Credit Suisse AG 2", 
								"id":"5002a"
							}
						]
					}
				]
			}
		]
  })