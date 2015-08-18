'use strict';

/* 
 * a factory providing access to the events REST service (RatesRS)
 */
angular.module('time')
.factory('EventService', function($log, $http, $q, cfg) {
	return {
		// list
		list: function() {		    
			return $http.get(cfg.events.SVC_URI)
			.success(function (data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: EventService.list() returned with status ' + status);
			});
		},
		// create
		post: function(item) {			
			var data = {eventsModel:item};
			return $http.post(cfg.events.SVC_URI, data)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: EventService.post() returned with status ' + status);
			});
		},
		// update
		put: function(item) {						
			var data = {eventsModel:item};
			return $http.put(cfg.events.SVC_URI + '/'+item.id, data)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: EventService.put() returned with Status ' + status);
			});
		},
		// delete
		delete: function(id) {			
			return $http.delete(cfg.events.SVC_URI + '/' + id)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: EventService.delete() returned with status ' + status);
			});
		}		
	};
});