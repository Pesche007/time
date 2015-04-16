'use strict';

/* 
 * a factory providing access to the Project REST service (ProjectRS)
 */
angular.module('time')
.factory('WorkrecordService', function($log, $http, cfg) {
	return {
		// list Companies
		list: function() {		  
			return $http.get(cfg.workrecord.SVC_URI)
			.success(function (data, status) {
				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ResourcesService.list() returned with status ' + status);
			});
		},	
		// create
		post: function(projectId, resourceId, startAt, durationHours, durationMinutes, rateId, isBillable, current) {
			var workrecord={'projectId':projectId, 'resourceId':resourceId, 'startAt':startAt, 'durationHours':durationHours, 'durationMinutes':durationMinutes, 'rateId':rateId, 'isBillable':isBillable};		
			var data = {workRecordData:workrecord};
			return $http.post(cfg.workrecord.SVC_URI, data)			
			.success(function(data, status) {
				data.current=current;
			})
			.error(function(data, status, headers, config) {
				
			});
		},
		// update
		put: function(id, projectId, resourceId, startAt, durationHours, durationMinutes, rateId, isBillable) {
			var workrecord={'id':id, 'projectId':projectId, 'resourceId':resourceId, 'startAt':startAt, 'durationHours':durationHours, 'durationMinutes':durationMinutes, 'rateId':rateId, 'isBillable':isBillable};		
			var data = {workRecordData:workrecord};
			return $http.put(cfg.workrecord.SVC_URI, data)			
			.success(function(data, status) {
				
			})
			.error(function(data, status, headers, config) {
				
			});

		},
		// delete
		delete: function(id) {
			return $http.delete(cfg.workrecord.SVC_URI + '/' + id)
			.success(function(data, status) {

			})
			.error(function(data, status, headers, config) {

			});
		},
	};
});