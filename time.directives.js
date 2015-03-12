'use strict';
angular.module('core')
.directive('timeQuickEntry', function($compile, $filter, ResourcesService){	
	return {
		restrict: "A",
		replace:true,
		scope: {},
		template: function(e, attr){
			var html='';
			html+='<div class="clearfix">';
			html+='		<script id="recursion.html" type="text/ng-template">';
			html+='			<a href="javascript:void(0)" ng-click="projectSelect(obj.id, obj.title)">{{obj.title}}</a>';
			html+='			<ul ng-if="obj.projects.length" class="dropdown-menu">';
			html+='				<li ng-repeat="obj in obj.projects" ng-class="{\'dropdown-submenu\':obj.projects.length}" ng-include="\'recursion.html\'"></li>';
			html+='			</ul>'
			html+='		</script>';
			html+='		<input type="text" class="form-control width150 pull-left margin-right-S margin-bottom-S" ng-model="company" typeahead="company as company.title for company in companies | filter:$viewValue | limitTo:8" typeahead-min-length="3" typeahead-on-select="loadProjects($item)" placeholder="Company">';			
	        html+='     <div class="dropdown pull-left margin-right-S margin-bottom-S" ng-if="projects">';
	        html+='			<button type="button" class="btn btn-default dropdown-toggle">';
	        html+='				{{projectTitle}} <span class="caret" ng-if="projects.length"></span>';
	        html+='			</button>';
	        html+='        	<ul class="dropdown-menu multi-level" role="menu" aria-labelledby="dropdownMenu">';
	        html+='           	<li ng-repeat="obj in projects" ng-class="{\'dropdown-submenu\':obj.projects.length}" ng-include="\'recursion.html\'"></li>';
	        html+='			</ul>';
	        html+='		</div>'
	        html+='		<form name="quickTimeForm" ng-if="showDateTime" class="pull-left margin-bottom-S form-inline animate-enter">';
	        html+='			<input type="text" class="form-control width100 margin-bottom-S" datepicker-popup="dd.MM.yyyy" ng-model="entry.date" ng-click="open($event, 0)" is-open="opened[0]" placeholder="Date" required>';	    
	        html+='			<div class="form-group has-feedback" ng-class="{\'has-error\':quickTimeForm.time_field.$error.pattern}">';
	        html+='				<input type="text" class="form-control width100 margin-bottom-S" name="time_field" ng-model="entry.time" ng-pattern="/(^\\\d{1,2}(?:\\\.\\\d{1,2})?$)|(^\\\d{4}(\\\-)\\\d{4})/" placeholder="Time" required>';            
	        html+='				<span ng-if="quickTimeForm.time_field.$error.pattern" class="fa fa-times form-control-feedback"></span>';
	        html+='			</div>';
            html+='			<textarea class="form-control single-line margin-bottom-S" ng-model="entry.comment" placeholder="Comment"></textarea>';
	        html+='			<button class="btn btn-primary" ng-disabled="quickTimeForm.$invalid" ng-click="submitForm()"><span class="fa fa-check"></span></button>';
	        html+='		</form>';
	        html+='</div>';
			return html;
		},
		controller: function($scope, ResourcesService){
 			$scope.companies = null;
 			$scope.projects = null;
 			$scope.projectTitle= 'Projects';
 			$scope.showDateTime=false;
 			$scope.entry={cmpid:null, prjid:null, date:$filter('date')(new Date(), 'yyyy-MM-dd'), time:null, comment:null};
				ResourcesService.listCompanies().then(function(result) {
			   		$scope.companies = result.data.companyData;
			   		}, function(reason) {//error
				       		
			  	});				
		  	$scope.loadProjects=function(obj)	{
				ResourcesService.listProjects(obj.id).then(function(result) {
					$scope.projects = result.data.projectData;
					if($scope.projects.length){
						$scope.projectTitle= 'Projects';
						$scope.entry.cmpid=obj.id;	
					}
					else {
						$scope.projectTitle= 'No Projects found';
					}
					$scope.showDateTime=false;
					emptyForm();
			       	}, function(reason) {//error

			  	});	
		  	};
		  	$scope.projectSelect=function(id, title){
		  		$scope.projectTitle=title;
		  		$scope.entry.prjid=id;
		  		emptyForm();
		  		$scope.showDateTime=true;
		  	};
		  	var emptyForm=function(){
		  		$scope.entry.date=$filter('date')(new Date(), 'yyyy-MM-dd');
		  		$scope.entry.time=null;
		  		$scope.entry.comment=null;		  				  	
		  	};
		  	$scope.submitForm=function(){
		  		console.log('submit');
		  		emptyForm();
				$scope.projectTitle= 'Projects';
				$scope.entry.prjid=null;		  		
		  		$scope.showDateTime=false;
		  	};
		  	//Datepicker
			$scope.opened=[];
			$scope.open = function($event, openid) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.opened[openid] = !$scope.opened[openid]
			};
		}
	};	
});