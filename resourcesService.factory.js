'use strict';

/* 
 * a factory providing access to the Project REST service (ProjectRS)
 */
angular.module('time')
.factory('ResourcesService', function($log, $http, cfg) {
	return {
		// list Companies
		listCompanies: function() {  
			return $http.get(cfg.wtt.SVC_URI)
			.success(function (data, status) {

			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.list() returned with status ' + status);
			});
		},	
		// list Projects as tree
		listProjectsTree: function(companyID) {  
			return $http.get(cfg.wtt.SVC_URI + '/' + companyID + '/astree')
			.success(function (data, status) {

			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.list() returned with status ' + status);
			});
		},
		// list Projects
		listProjects: function(companyID, projectID) {  
			if(projectID!==''){
				projectID += '/project/';
			}
			return $http.get(cfg.wtt.SVC_URI + '/' + companyID + '/project/' + projectID)
			.success(function (data, status) {

			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.list() returned with status ' + status);
			});
		},
		// create
		post: function(companyID, projectID, project) {
			if(projectID!==''){
				projectID += '/project/';
			}
			var data = {projectModel:project};			
			return $http.post(cfg.wtt.SVC_URI + '/' + companyID + '/project/' + projectID, data)
			.success(function(data, status) {

			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.post() returned with status ' + status);
			});
		},
		// update
		put: function(companyID, project) {
			var data = {projectModel:project};
			return $http.put(cfg.wtt.SVC_URI + '/' + companyID + '/project/' + project.id, data)
			.success(function(data, status) {

			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.put() returned with status ' + status);
			});
		},
		// delete
		delete: function(companyID, parentID, projectID) {			
			if(parentID===''){
				var projectURL = projectID;
			}
			else {
				var projectURL = parentID + '/project/' + projectID;
			}
			$log.log(cfg.wtt.SVC_URI + '/' + companyID + '/project/' + projectURL)
			return $http.delete(cfg.wtt.SVC_URI + '/' + companyID + '/project/' + projectURL)
			.success(function(data, status) {

			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.delete() returned with status ' + status);
			});
		},
	};
});