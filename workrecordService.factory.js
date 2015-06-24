'use strict';

/* 
 * a factory providing access to the Project REST service (ProjectRS)
 */
angular.module('time')
.factory('WorkrecordService', function($log, $http, $q, cfg) {
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
		post: function(obj) {	
			var workrecord={workRecordModel:obj}					
			return $http.post(cfg.workrecord.SVC_URI, workrecord)			
			.success(function(data, status) {
				console.log(data)
			})
			.error(function(data, status, headers, config) {
				
			});
		},
		savemulti:function(arr){
			console.log('saving', arr)
			var postOBJ=[];
			for(var i=0;i<arr.length;i++){
				var workrecord = {workRecordModel:arr[i]};
				if(arr[i].id){
					if(arr[i].$$deleted){
						console.log('delete', workrecord)
						postOBJ.push($http.delete(cfg.workrecord.SVC_URI + '/' + arr[i].id));
					}
					else {
						postOBJ.push($http.put(cfg.workrecord.SVC_URI + '/' + arr[i].id, workrecord));
					}
				}
				else {
					postOBJ.push($http.post(cfg.workrecord.SVC_URI, workrecord));
				}
			}
			return $q.all(postOBJ).then(function(data){
				console.log('success', data);
			  }, function(response) {
			    console.log('fail', response);
			});

		},
		// update
		put: function(obj) {
			var workrecord={workRecordModel:obj};
			return $http.put(cfg.workrecord.SVC_URI + '/' + obj.id, workrecord)			
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