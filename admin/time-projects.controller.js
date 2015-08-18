'use strict';

angular.module('time')
  .controller('TimeProjectCtrl', function ($scope, $http, cfg, ResourcesService, alertsManager, sharedProperties) {
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
			var data = result.data.projectTreeNodeModel;
			if(data.projects){
				var treeData = addTreeLevel(data.projects);
			}
			else{
				var treeData = [];
			}
			$scope.projectsOPT.projects=treeData;
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

	/** DEBUG **/
	$scope.sharedProperties = sharedProperties.getProperties();
 });