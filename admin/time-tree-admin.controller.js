'use strict';

angular.module('time')
  .controller('TreeAdminCtrl', function ($scope, $log, RatesService, cfg, statePersistence) {
	//API
	$scope.API={};

	$scope.API.getTree = function () {	
		var obj=[];
		for(var i=0;i<2;i++) {
			var tmp={id: 'CmpA'+i, title: 'Company A'+i, type:'company', children: [
					{id: 'PjtA1'+i, title: 'Project A1'+i, type:'project', people:[], children: [
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
	}		

	//Options for tree - idea: 
	// save all actions and objects handleded as tmp saves 
	// and then act upon them (e.g. create subtree -> stores action "add", 
	// then enter name and save -> tmp action "add" execute
	$scope.treeOPT=
		{
			addeditShow:false,
			deleteShow:false,
			tmpobj:'',
			tmpindex:0,
			tmppeople:[],
			peopleselect:[],
			catName: '',
			treeitemDesc:'',
			treeAction:'',
			treePeopleView:0, 
			treeRatesView:0, 
			items:[]
		};
	$scope.API.getTree();
	$scope.API.getPeople = function(){
		return [{'id':'007', 'firstname':'Peter', 'lastname':'Windemann'}, {'id':'001alpha', 'firstname':'Bruno', 'lastname':'Kaiser'}, {'id':'123-KK', 'firstname':'Thomas', 'lastname':'Huber'}];	
		};
	//Load config
	$scope.people=$scope.API.getPeople();
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
		$log.log($scope.MultiplePeople);
		};
					
	//************************************** Tree **************************************
	//Sets and Shows tree for selected company
	$scope.selectedComp=null;
	$scope.editTreebranch = function(obj){
		$scope.treeOPT.tmpobj=obj;
		$scope.treeOPT.addeditShow=true;
	};
	$scope.addNewProject = function(){
		$scope.treeOPT.tmpobj.children.unshift({id:Math.random().toString(36).substr(2, 9), title: $scope.treeOPT.catName, type:'project', childrenVisible: true, children:[], people:[]});
		$scope.treeOPT.addeditShow=false;
		$scope.treeOPT.catName='';
	};
	$scope.deleteSubProjects = function(){
		console.log('delete');
	};
	$scope.closeEditField = function(){
		$scope.treeOPT.tmpobj='';
		$scope.treeOPT.addeditShow=false;
	};
	$scope.showTree = function(obj){
		$scope.treetoggleBranchAll(obj);
		$scope.selectedComp=[obj];
		};
	$scope.resetTreeView = function(){
		$scope.selectedComp=null;
		$scope.closeEditField();
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

	/************** RATES ****************/
	$scope.rates = [];
	//RatesService.list();
   	RatesService.list().then(function(result) {
       $scope.rates=result.data;
   });	

	$scope.ratesTMP={'view':false, 'edit':false, 'index':0, 'tmpobj':{'id':'', 'title':'', 'rate':'', 'description':''}};
	$scope.addRate=function(){
		$scope.rateFormreset();
		$scope.rateToggle(1);
		};
	$scope.rateSave = function(){

		// TODO: add currency (selection box)
		var _rate = {};
		_rate.id = $scope.ratesTMP.tmpobj.id;
		_rate.title = $scope.ratesTMP.tmpobj.title;
		_rate.rate = $scope.ratesTMP.tmpobj.rate;
		_rate.description = $scope.ratesTMP.tmpobj.description;

		if($scope.ratesTMP.edit) {		// update  -> put
			RatesService.put(_rate);
			$scope.rates[$scope.ratesTMP.index] = _rate;
		}
		else {		// create -> post
			RatesService.post(_rate);
			$scope.rates.push(_rate); 
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
	$scope.rateDelete = function(id, index) {
		RatesService.delete(id);
		$scope.rates.splice(index, 1);
		$scope.rateToggle(0);
		$scope.rateFormreset();
	};
	$scope.rateToggle = function(dir){
		$scope.ratesTMP.view=dir;
		};
	$scope.rateFormreset = function(){
		$scope.ratesTMP.tmpobj={'id':'', 'title':'', currency:'', 'rate':'', 'description':''};		
		};	
	$scope.rateRestore = function(){
		$scope.ratesTMP={ratesEdit:0, 'view':0, 'edit':0, 'index':0, 'tmpobj':{'id':'', 'title':'', currency:'', 'rate':'', 'description':''}};
	};
	
	//Persistance
    $scope.$on('$destroy', function(){
		statePersistence.setState('time-admin', {treeOPT: $scope.treeOPT, selectedComp: $scope.selectedComp});
		});
    var persVar=statePersistence.getState('time-admin');
    if(persVar) {
    	for(var key in persVar){
    		$scope[key]=persVar[key];
    	}    	
    }		
  });