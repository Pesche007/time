'use strict';

/* 
 * a factory providing access to the rates REST service (RatesRS)
 */
angular.module('time')
.factory('RatesService', function($log, $http, cfg) {
	return {
		// list
		list: function() {
		    $log.log('RatesService.list() calling get(' + cfg.rates.SVC_URI + ')');	    
			return $http.get(cfg.rates.SVC_URI)
			.success(function (data, status) {
				$log.log('data=<' + angular.toJson(data.ratesData, 4) + '>');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.list() returned with status ' + status);
			});
		},
		// create
		post: function(rate) {
			$log.log('RatesService.post() calling post(' + cfg.rates.SVC_URI + ', ' + angular.toJson(rate) + ')');
			var data = {ratesData:rate};
			return $http.post(cfg.rates.SVC_URI, data)
			.success(function(data, status) {
				$log.log('created successfully');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.post() returned with status ' + status);
			});
		},
		// read
		get: function(id) {
			$log.log('RatesService.get(' + id + ') calling get(' + cfg.rates.SVC_URI + '/' + id + ')');
			$http.get(cfg.rates.SVC_URI + '/' + id)
			.success(function(data, status) {
				$log.log('-> ' + data);
				return data;
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.get(' + id + ') returned with status ' + status);
			});
		},
		// update
		put: function(rate) {
			$log.log('RatesService.put() calling put(' + cfg.rates.SVC_URI + ', ' + angular.toJson(rate) + ')');
			var data = {ratesData:rate};
			return $http.put(cfg.rates.SVC_URI, data)
			.success(function(data, status) {
				$log.log('updated successfully');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.put() returned with Status ' + status);
			});
		},
		// delete
		delete: function(id) {
			$log.log('RatesService.delete(' + id + ') calling delete(' + cfg.rates.SVC_URI + '/' + id + ')');
			return $http.delete(cfg.rates.SVC_URI + '/' + id)
			.success(function(data, status) {
				$log.log('deleted successfully');
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.delete() returned with status ' + status);
			});
		},
		// count
		count: function() {
			$log.log('RatesService.count() calling get(' + cfg.rates.SVC_URI + '/count');
			$http.get(cfg.rates.SVC_URI + '/count')
			.success(function(data, status) {
				$log.log('-> ' + data);
				return data;
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.count() returned with status ' + status);
			});
		}
	};
});