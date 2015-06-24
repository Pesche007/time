'use strict';

angular.module('time')
  .controller('TimeProjectCtrl', function ($scope, cfg, ResourcesService, alertsManager, $http) {
	//Get Companies 
	$scope.companyOPT={companyLoaded:0, companies:[], selectedCompany:[]};

	ResourcesService.listCompanies().then(function(result) {
		$scope.companyOPT.companies=result.data.companyModel;
		$scope.companyOPT.companyLoaded=1;
	}, function(reason) {//error
		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	});
	$scope.selectCompany=function(item){
		$scope.companyOPT.selectedCompany=item;
		getProjects(item.id);
	};

	//Get Projects of company
	$scope.projectsOPT={projectsLoaded:0, projects:[]};
	var getProjects = function(companyid) {		
		ResourcesService.listProjectsTree(companyid).then(function(result) {
			var data = addTreeLevel(result.data.projectTreeNodeModel.projects);
			$scope.projectsOPT.projects=data;
			$scope.projectsOPT.projectsLoaded=1;
			$scope.projectsStructure=[
				{ name:'Name', field: 'title', inputType:'text'}
			];			
		}, function(reason) {//error
			alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});
	};

	//Handle Directive Call
	$scope.projectsFunction = function (action, param, data){
		if(action===1){//Get
			getSubProjects(param);
		}
		if(action===2){//Save new
			projectNewSave(param, data);
		}
		if(action===3){//Edit Save
			projectsEditSave(param);
		}
		if(action===4){//Remove
			projectsEditRemove(param);
		}		
		if(action===91){//Check if childnodes
			return checkChildNodes(param.id);
		}		
	};


	//Check for childnodes
	var checkChildNodes = function(projectID){
		return ResourcesService.listProjects($scope.companyOPT.selectedCompany.id, projectID).then(function(result) {
			var data=result.data.projectModel;
			return data.map(function(e){return e.title;});				
		});
	};
	//Get subprojects of company -> project
	var getSubProjects = function(param) {
		ResourcesService.listProjects($scope.companyOPT.selectedCompany.id, param.id).then(function(result) {
			var data = 	result.data.projectModel;			
			var subArray = $scope.projectsOPT.projects.map(function(e){return e.id;});
			var index = subArray.indexOf(param.id) + 1; //next position			
			var level = param.$$treeLevel + 1; //next level
			for(var i=0;i<data.length;i++){
				data[i].$$treeLevel=level;
				var subIndex=subArray.indexOf(data[i].id);
				if(subIndex!==-1) {//Data set already exists					
					$scope.projectsOPT.projects.splice(subIndex, 1, data[i]);
					}
				else{//New Data set
					$scope.projectsOPT.projects.splice(index, 0, data[i]);	
				}
			}
		}, function(reason) {//error
			alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});
	};
	//Save Projects -> New
	var projectNewSave = function(param, parentRow){
		var project='';
		if(parentRow){
			project=parentRow.id;
		}
		ResourcesService.post($scope.companyOPT.selectedCompany.id, project, param).then(function(result) {
			var data=result.data.projectModel;			
			if(parentRow){
				data.$$treeLevel=parentRow.$$treeLevel+1;
				var index = $scope.projectsOPT.projects.map(function(e){return e.id;}).indexOf(parentRow.id) + 1;
				$scope.projectsOPT.projects.splice(index, 0, data);
			}
			else {
				data.$$treeLevel=0;
				$scope.projectsOPT.projects.push(data);			
			}
		}, function(reason) {//error
   			alertsManager.addAlert('Could not create project. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});
	};
	//Save Projects -> Edit
	var projectsEditSave = function(param){
		ResourcesService.put($scope.companyOPT.selectedCompany.id, param).then(function(result) {
			var index = $scope.projectsOPT.projects.map(function(e) { return e.id;}).indexOf(param.id);
			var data = result.data.projectModel;
			data.$$treeLevel=param.$$treeLevel;
			$scope.projectsOPT.projects[index] = data;				
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not update project. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		}); 		
	};
	//Delete Projects
	var projectsEditRemove = function(param) {
		var index = $scope.projectsOPT.projects.map(function(e) { return e.id;}).indexOf(param.id);
		var level = param.$$treeLevel;		
		if(level===0){//first level project
			var parentID='';
		}
		else {//sub-project - need to find parent. Loop backwards from position until finding element with 1 level lower = parent
			for(var i=index-1;i>=0;i--){
				if($scope.projectsOPT.projects[i].$$treeLevel === level - 1){
					var parentID=$scope.projectsOPT.projects[i].id;
					break;
				};	
			}			
		}
		var childnodes=checkChildNodes(param.id);
   		childnodes.then(function(obj) {
			ResourcesService.delete($scope.companyOPT.selectedCompany.id, parentID, param.id).then(function(result) {			
				var num=1;
				if(obj.length){//child nodes in tree - find number of child nodes and splice them out
					for(var i=index+1;i<$scope.projectsOPT.projects.length;i++){
						if($scope.projectsOPT.projects[i].$$treeLevel > level){
							num++;
						}
						else{
							break;
						}
					}
				}				
				$scope.projectsOPT.projects.splice(index, num);					
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not delete rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
			}); 			
		});			
	};	

	//******************** HELPER *******************//
	//Recursion through tree, adds level and flattens tree
	var addTreeLevel = function(data){
		var output=[];
		var level=0;
		var recurse=function(obj, level){
			output.push({id:obj.id, title:obj.title, $$treeLevel:level});
			if(obj.projects && obj.projects.length){
				level++;
				for(var j=0; j<obj.projects.length;j++){
					recurse(obj.projects[j], level);
				}	
			}
		}
		for(var i=0; i<data.length;i++){
			recurse(data[i], level);
		}
		return output;
	};
	//Adds treeView level to data	
	var addLevelToProjects = function (data, level){
		for(var i=0;i<data.length;i++){				
			data[i].$$treeLevel=level;
		}
		return data;
	};	
	
	/**** DATA INIT *****/
	
	//Company + Projects + Sub-projects
	/*
	//var comp = {companyModel : {'title':'Test Projekt-Firma'}};
	var comp = {companyModel : {'title':'Test Firma für Projekte'}};
	$http.post('http://localhost:8080/opentdc-services-test/api/company', comp).success(function(result) {
		console.log('create company', result)
		for(var i=1; i<3;i++) {
			var proj = {title:'Test-Projekt' + i};
			ResourcesService.post(result.companyModel.id, '', proj).then(function(data) {
				console.log('create project', data)
				for(var j=1; j<3;j++) {
					proj = {'title':'Test-Sub-Projekt' + j};
					ResourcesService.post(result.companyModel.id, data.data.projectModel.id, proj).then(function(result) {
						console.log('create sub-project', result)
					})
				}
			})
		}
	})
	
	/*
	//Adressbook + Contact
	var adressbook = {addressbookModel : {'name':'Privates Adressbuch'}};
	$http.post('http://localhost:8080/opentdc-services-test/api/addressbooks', adressbook).success(function(result) {	
		console.log('create addressbok', result);	
		for(var i=1; i<4;i++) {
			var person = {contactModel:{firstName:'Vorname ' + i, lastName:'Nachname ' + i}};
			$http.post('http://localhost:8080/opentdc-services-test/api/addressbooks/'+result.addressbookModel.id+'/contact', person).success(function(result) {
				console.log('create person', result);				
			})
		}
	})
	
	
	
	/*
	//Test if AdressModel has a flaw
	var address={addressModel:{"id":"92a6a114-b8d5-4f1e-917e-bc837f5ccdff","attributeType":"email","type":"Arbeit","value":"Test1234","createdAt":"2015-06-16T14:36:08.020+02:00","createdBy":"DUMMY_USER","modifiedAt":"2015-06-16T14:36:08.020+02:00","modifiedBy":"DUMMY_USER"}};
	$http.put('http://localhost:8080/opentdc-services-test/api/addressbooks/e95af27d-18cf-4733-a7e0-a21b329084cd/contact/6b6f11d5-22b8-4455-abb3-a7850eeb239a/address/92a6a114-b8d5-4f1e-917e-bc837f5ccdff', address)
	
	/*
	//$http.delete('http://localhost:8080/opentdc-services-test/api/company/de9fafb2-7399-476f-8326-413291e2476c')
	*/
 });