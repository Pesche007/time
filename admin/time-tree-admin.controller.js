'use strict';

angular.module('time')
  .controller('TreeAdminCtrl', function ($scope, $log, RatesService, ResourcesService, cfg, statePersistence, alertsManager) {
  	$scope.API={};
	$scope.treeOPT=	{addeditShow:false, currProj:{projectName:''}, newProj:{title:'', description:''}, tmpobj:'', tmppeople:[], peopleselect:[], treePeopleView:0,  treeRatesView:0, companies:[], selectedComp:null};
	ResourcesService.listCompanies().then(function(result) {
   		$scope.treeOPT.companies=result.data.companyData;
       	}, function(reason) {//error
       		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	}); 
	
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
	$scope.showTree = function(obj){
		ResourcesService.listProjects(obj.id).then(function(result) {
			$scope.treeOPT.selectedComp=obj;
			$scope.treeOPT.selectedComp.isCompany=1;
			$scope.treeOPT.selectedComp.projects=result.data.projectData;
	       	}, function(reason) {//error
	       		alertsManager.addAlert('Could not get projects. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});		
	};	
	$scope.editTreebranch = function(obj){
		$scope.treeOPT.tmpobj=obj;
		$scope.treeOPT.currProj.projectName = angular.copy(obj.title); //Avoid that title changes immediately on input in edit field
		$scope.treeOPT.addeditShow=true;
	};
	$scope.editProject = function(){
		$scope.treeOPT.tmpobj.title=angular.copy($scope.treeOPT.currProj.projectName);
		ResourcesService.put($scope.treeOPT.selectedComp.id, $scope.treeOPT.tmpobj).then(function(result) {
			$scope.treeOPT.tmpobj=result.data.projectData;
	       	}, function(reason) {//error
	       		alertsManager.addAlert('Could not update project. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});
	};
	$scope.addNewProject = function(){
		var porjectID=$scope.treeOPT.tmpobj.isCompany ? '' : $scope.treeOPT.tmpobj.id;
		ResourcesService.post($scope.treeOPT.selectedComp.id, porjectID, $scope.treeOPT.newProj).then(function(result) {			
			if($scope.treeOPT.tmpobj.isCompany){
				$scope.treeOPT.selectedComp.projects.unshift(result.data.projectData);
			}
			else {
				if($scope.treeOPT.tmpobj.projects) {
					$scope.treeOPT.tmpobj.projects.unshift(result.data.projectData);
				}
				else{
					$scope.treeOPT.tmpobj.projects=[result.data.projectData];
				}
			}
			$scope.treeOPT.tmpobj.childrenVisible=1;
			$scope.closeEditField();
	    	}, function(reason) {//error
	       		alertsManager.addAlert('Could not add project. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});		
	};
	$scope.deleteSubProjects = function(){
		ResourcesService.delete($scope.treeOPT.selectedComp.id, $scope.treeOPT.tmpobj.id).then(function(result) {			
			$scope.closeEditField();
			$scope.showTree($scope.treeOPT.selectedComp);
	       	}, function(reason) {//error
	       		alertsManager.addAlert('Could not delete project. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	  	});	
	};
	$scope.closeEditField = function(){
		$scope.treeOPT.tmpobj='';
		$scope.treeOPT.addeditShow=false;
		$scope.treeOPT.newProj={title:'', description:''};
	};
	$scope.resetTreeView = function(){
		$scope.treeOPT.selectedComp.projects=null;
		$scope.closeEditField();
	};

	/************** RATES ****************/
	$scope.ratesTMP={rates:[], view:false, edit:false, index:0, tmpobj:{id:'', title:'', currency:'', rate:'', description:''}};
   	RatesService.list().then(function(result) {
   		$scope.ratesTMP.rates=result.data.ratesData;
       	}, function(reason) {//error
       		alertsManager.addAlert('Could not get rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  	}); 	

	$scope.addRate=function(){
		$scope.rateFormreset();
		$scope.rateToggle(1);
		};
	$scope.rateSave = function(){
		if($scope.ratesTMP.edit) {// update  -> put
			RatesService.put($scope.ratesTMP.tmpobj).then(function(result) {
   				$scope.ratesTMP.rates[$scope.ratesTMP.index] = result.data.ratesData;
   				$scope.rateCancel();
       		}, function(reason) {//error
       		alertsManager.addAlert('Could not update rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  			}); 			
		}
		else {// create -> post
			RatesService.post($scope.ratesTMP.tmpobj).then(function(result) {
   				$scope.ratesTMP.rates.push(result.data.ratesData);
   				$scope.rateCancel();
       		}, function(reason) {//error
       		alertsManager.addAlert('Could not create rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
  			}); 					
		}
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
		RatesService.delete(id).then(function(result) {
			$scope.ratesTMP.rates.splice(index, 1);
			$scope.rateCancel();
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not delete rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
		}); 
	};
	$scope.rateToggle = function(dir){
		$scope.ratesTMP.view=dir;
		};
	$scope.rateFormreset = function(){
		$scope.ratesTMP.tmpobj={id:'', title:'', currency:'', rate:'', description:''};		
		};	
	$scope.rateRestore = function(){
		$scope.rateToggle(0);
		$scope.rateFormreset();
		$scope.ratesTMP.ratesEdit=false;
		$scope.ratesTMP.view=false;
	};		
  });