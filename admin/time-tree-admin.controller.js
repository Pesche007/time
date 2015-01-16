'use strict';

angular.module('time')
  .controller('TreeAdminCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('TimeAppName', 'fa-tumblr', 'time', 'app/time/menu.html');
	//API
	$scope.API={};
	$scope.API.getTree = function () {
		var obj=[];
		for(var i=0;i<100;i++) {
			var tmp={id: 'CmpA'+i, title: 'Company A'+i, type:'company', children: [
					{id: 'PjtA1'+i, title: 'Project A1'+i, type:'project', children: [
						 {id: 'SPjtA11'+i, title: 'Sub-Project A11'+i, type:'project', children:[
						 	{id: 'SSPjtA11'+i, title: 'Sub-Sub-Project A111'+i, type:'project', children: [], people:[]}
						], people:[ {'id': '007', 'firstname': 'Peter', 'lastname': 'Windemann'}]}, 
						 {id: 'SPjtA12'+i, title: 'Sub-Project A12'+i, type:'project', children:[
						 {id: 'SSPjtA12'+i, title: 'Sub-Sub-Project A112'+i, type:'project', children: [], people:[ {'id': '007', 'firstname': 'Peter', 'lastname': 'Windemann'}]}
						 ], people:[ {'id': '007', 'firstname': 'Peter', 'lastname': 'Windemann', 'rate': '000003'}]}
					 ]}
				]};
			obj.push(tmp);
			}
		return obj;
		};
	$scope.API.getPeople = function(){
		return [{'id':'007', 'firstname':'Peter', 'lastname':'Windemann'}, {'id':'001alpha', 'firstname':'Bruno', 'lastname':'Kaiser'}, {'id':'123-KK', 'firstname':'Thomas', 'lastname':'Huber'}];	
		};
	$scope.API.getRates = function() {
		var rates =  [
			{id: '000001', title: 'Junior Rate', rate:500},
			{id: '000002', title: 'Senior Rate', rate:1000},
			{id: '000003', title: 'Executive Rate', rate:2000},
		];
		return rates;
		};
	//Load config
	$scope.people=$scope.API.getPeople();
	$scope.rates=$scope.API.getRates();	
	//************************************** Select Multiple **************************************
	$scope.removeMultiSinglePerson = function(data, model){
		$scope.deleteExistingMulti(data, model, 'id');
		};
	//delete element from array of objects
	$scope.deleteExistingMulti = function(data, model, selector) {
		for (var i = 0, len = model.length; i < len; i++) {
			if (model[i][selector]=== data[selector]) {
				model.splice(i, 1);
				break;
				}
			}	
		};
	//check if element exists in array of objects
	$scope.checkExistingMulti = function(data, model) {
		var checkVar=true;
		for (var i = 0, len = model.length; i < len; i++) {
			if (model[i].id=== data.id) {
				checkVar=false;
				break;
				}
			}	
		return checkVar; 		
		};
	$scope.updatePeople = function (data, model, selector){
		if($scope.checkExistingMulti(data, model)) {
			model.push(data);
			}
		$scope.treeOPT[selector]=[];
		};	
	$scope.selectMultiPerson = function(data, model){
		if($scope.checkExistingMulti(data, model)) {
			model.push(data);
			}
		};		
	$scope.logMultiPerson = function(){
		console.log($scope.MultiplePeople);
		};
					
	//************************************** Tree **************************************
	//Options for tree - idea: save all actions and objects handleded as tmp saves and then act upon them (e.g. create subtree -> stores action "add", then enter name and save -> tmp action "add" execute
	$scope.treeOPT={addeditShow:false,deleteShow:false,tmpobj:'',tmpindex:0,tmppeople:[],peopleselect:[],catName: '',treeitemDesc:'',treeAction:'',treePeopleView:0, treeRatesView:0, items:$scope.API.getTree()};
	//Sets and Shows tree for selected company
	$scope.selectedComp={};
	$scope.showTree = function(obj){
		$scope.treetoggleBranchAll(obj);
		$scope.selectedComp=new Array(obj);
		};
	//remove all input modal divs
	$scope.treeRemoveAllShow = function(){
		$scope.treeOPT.addeditShow=false;
		$scope.treeOPT.deleteShow=false;
		$scope.treeOPT.assignPersonshow=false;
		};
	//show manage/add/edit modal div -> show=action
	$scope.treeShow = function(show){
		$scope.treeOPT[show]=true;
		};
	//add selected object (obj) and index in array (i) to tmp
	$scope.treeaddtoTMP = function(obj, i){
		$scope.treeOPT.tmpobj=obj;
		$scope.treeOPT.tmpindex=i;		
		};
	//save selected action to tmp for further use
	$scope.setTreeaction = function(action){
		$scope.treeOPT.treeAction=action;
		};
	//set description on modal div to txt
	$scope.setTreeDescription = function(txt){
		$scope.treeOPT.treeitemDesc=txt;
		};
	//set value of input field of modal edit div
	$scope.setModalInput = function(txt) {
		$scope.treeOPT.catName=txt;
		};
	//Open/hide tree
	$scope.treeToggleChildren = function(obj) {		
		obj.childrenVisible = !obj.childrenVisible;
		};
	//Toggle expand/collapse all
	$scope.treeToggleChildrenAll = function(dir, obj) {
		angular.forEach(obj, function(value) {
			value.childrenVisible=dir;
			if(value.children) {
				$scope.treeToggleChildrenAll(dir, value.children);		
				}
			});		
		};
	//Toggle expand/collapse one branch
	$scope.treetoggleBranchAll = function(obj) {
		obj.childrenVisible=true;
		$scope.treeToggleChildrenAll(true, obj.children);
		};
	//through cleanup off all tmp saves
	$scope.treeCleartmp = function(){
		$scope.treeRemoveAllShow();
		$scope.treeOPT.tmpobj='';
		$scope.treeOPT.tmpindex=0;
		$scope.treeOPT.catName='';
		$scope.treeOPT.treeitemDesc='';
		$scope.treeOPT.treeAction='';
		$scope.treeOPT.tmppeople=[];
		};
	//Record tree action 
	$scope.treeAction = function(obj, index, action){
		$scope.treeRemoveAllShow();
		$scope.treeaddtoTMP(obj, index);
		$scope.setTreeaction(action);
		var txt='';
		if(action==='add') {
			$scope.treeShow('addeditShow');
			txt=obj.title!==undefined ? 'Add new element to ' +obj.title : 'Add new element to root';
			}
		else if(action==='assign_person') {
			$scope.treeShow('assignPersonshow');
			txt='Select person to assign to '+obj.title;			
			//Assign values but don't link $scope.treeOPT.tmppeople=obj => links it to scope
			angular.forEach(obj.people, function(item) {
				$scope.treeOPT.tmppeople.push(item);		
				});
			}
		else if(action==='edit') {
			$scope.treeShow('addeditShow');
			txt='Change name for element '+obj.title;
			$scope.setModalInput(obj.title);
			}
		else if(action==='delete') {
			$scope.treeShow('deleteShow');
			var subtreeTXT=obj.children[index].children.length ? ' and all its subtrees':'';
			txt='Confirm: Delete ' + obj.children[index].title + subtreeTXT + '?';			
			}
		else {
			//proper error handling
			return false;
			}			
		$scope.setTreeDescription(txt);
		};
	//Executes saved tmp action on click on "Save" button
	$scope.treeActionExec = function() {
		if($scope.treeOPT.treeAction==='add') {
			if($scope.treeOPT.tmpobj==='root') {
				$scope.treeOPT.items.unshift({'title': $scope.treeOPT.catName, 'type':'company', 'childrenVisible': true, children:[]});
				}
			else {
				$scope.treeOPT.tmpobj.children.unshift({'title': $scope.treeOPT.catName, 'type':'project', 'childrenVisible': true, children:[]});	
				}
			}
		else if($scope.treeOPT.treeAction==='assign_person') {
			$scope.treeOPT.tmpobj.people=$scope.treeOPT.tmppeople;
			}
		else if($scope.treeOPT.treeAction==='edit') {
			$scope.treeOPT.tmpobj.title=$scope.treeOPT.catName;
			}
		else if($scope.treeOPT.treeAction==='delete') {
			$scope.treeOPT.tmpobj.children.splice($scope.treeOPT.tmpindex, 1);
			}
		else {
			//proper error handling
			return false;
			}
		$scope.treeCleartmp();
		};
	/************** RATES ****************/
	$scope.ratesTMP={'view':false, 'edit':false, 'index':0, 'tmpobj':{'id':'', 'title':'', 'rate':'', 'description':''}};
	$scope.addRate=function(){
		$scope.rateFormreset();
		$scope.rateToggle(1);
		};
	$scope.rateSave = function(){
		if($scope.ratesTMP.edit) {
			$scope.rates[$scope.ratesTMP.index]=angular.copy($scope.ratesTMP.tmpobj);
			}
		else {
			$scope.rates.push(angular.copy($scope.ratesTMP.tmpobj));
			}
		$scope.rateToggle(0);
		$scope.rateFormreset();
		};
	$scope.rateCancel = function(){
		$scope.rateToggle(0);
		$scope.rateFormreset();
		};
	$scope.rateEdit = function(rate, i){
		$scope.rateToggle(1);
		$scope.ratesTMP.edit=true;
		$scope.ratesTMP.index=i;
		$scope.ratesTMP.tmpobj=angular.copy(rate);
		};
	$scope.rateDelete = function(i){
		$scope.rates.splice(i, 1);
		$scope.rateToggle(0);
		$scope.rateFormreset();		
		};
	$scope.rateToggle = function(dir){
		$scope.ratesTMP.view=dir;
		};
	$scope.rateFormreset = function(){
		$scope.ratesTMP={'view':false, 'edit':false, 'index':0, 'tmpobj':{'id':'', 'title':'', 'rate':'', 'description':''}};
		};			
  });