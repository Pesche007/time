'use strict';

/* 
 * a factory providing access to the Project REST service (ProjectRS)
 */
angular.module('time')
.factory('ResourcesService', function($log, $http, cfg) {
	return {
		// list Companies
		listCompanies: function() {
		    $log.log('ResourcesService.list() calling get(' + cfg.wtt.SVC_URI + ')');	    
			return $http.get(cfg.wtt.SVC_URI)
			.success(function (data, status) {
				$log.log('data=<' + angular.toJson(data.companyData, 4) + '>');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.list() returned with status ' + status);
			});
		},	
		// list Projects
		listProjects: function(id) {
		    $log.log('ResourcesService.list() calling get(' + cfg.wtt.SVC_URI + ')');	    
			return $http.get(cfg.wtt.SVC_URI + '/' + id + '/project/astree')
			.success(function (data, status) {
				$log.log('data=<' + angular.toJson(data.projectData, 4) + '>');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.list() returned with status ' + status);
			});
		},
		// create
		post: function(companyID, projectID, project) {
			$log.log('ResourcesService.post() calling post(' + cfg.wtt.SVC_URI + ', ' + angular.toJson(project) + ')');
			var data = {projectData:project};
			var addURL = projectID==='' ? '' : projectID + '/subproject';			
			return $http.post(cfg.wtt.SVC_URI + '/' + companyID + '/project/' + addURL, data)
			.success(function(data, status) {
				$log.log('created successfully');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.post() returned with status ' + status);
			});
		},
		// update
		put: function(companyID, project) {
			$log.log('ResourcesService.put() calling put(' + cfg.wtt.SVC_URI + ', ' + angular.toJson(project) + ')');
			var data = {projectData:project};
			return $http.put(cfg.wtt.SVC_URI + '/' + companyID + '/project', data)
			.success(function(data, status) {
				$log.log('updated successfully');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.put() returned with Status ' + status);
			});
		},
		// delete
		delete: function(companyID, id) {
			$log.log('ResourcesService.delete(' + id + ') calling delete(' + cfg.wtt.SVC_URI + '/' + id + ')');
			return $http.delete(cfg.wtt.SVC_URI + '/' + companyID + '/project/' + id)
			.success(function(data, status) {
				$log.log('deleted successfully');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.delete() returned with status ' + status);
			});
		},
	};
});