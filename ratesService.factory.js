'use strict';

/* 
 * a factory providing access to the rates REST service (RatesRS)
 */
angular.module('time')
.factory('RatesService', function($log, $http, cfg) {
	return {
		// list
		list: function() {		    
			return $http.get(cfg.rates.SVC_URI)
			.success(function (data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.list() returned with status ' + status);
			});
		},
		// create
		post: function(rate) {			
			var data = {rateModel:rate};
			return $http.post(cfg.rates.SVC_URI, data)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.post() returned with status ' + status);
			});
		},
		// read
		get: function(id) {			
			$http.get(cfg.rates.SVC_URI + '/' + id)
			.success(function(data, status) {
				return data;
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.get(' + id + ') returned with status ' + status);
			});
		},
		// update
		put: function(rate) {						
			var data = {rateModel:rate};
			return $http.put(cfg.rates.SVC_URI + '/'+rate.id, data)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.put() returned with Status ' + status);
			});
		},
		// delete
		delete: function(id) {			
			return $http.delete(cfg.rates.SVC_URI + '/' + id)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.delete() returned with status ' + status);
			});
		}		
	};
});