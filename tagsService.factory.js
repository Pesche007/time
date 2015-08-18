'use strict';

/* 
 * a factory providing access to the rates REST service (RatesRS)
 */
angular.module('time')
.factory('TagsService', function($log, $http, $q, cfg) {
	return {
		// list
		list: function() {		    
			return $http.get(cfg.tags.SVC_URI)
			.success(function (data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: TagsService.list() returned with status ' + status);
			});
		},
		// create
		createId:function(){
			return $http.post(cfg.tags.SVC_URI, {tagModel:{}})
			.success(function (data, status) {	
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: TagsService.list() returned with status ' + status);
			});
		},
		saveEntry: function(tag, tagId) {
			var postOBJ=[], langCodes=['DE', 'EN', 'FR', 'IT', 'RM', 'ES'], k, entry;
			for (k in tag){
				entry={};
				if(tag[k]!=="" && langCodes.indexOf(k)!==-1){//lang set
					if(tag[k + '_OPT']){//PUT
						entry.localizedTextModel = angular.copy(tag[k + '_OPT']);						
						entry.localizedTextModel.text = tag[k];	
						entry.localizedTextModel.languageCode = angular.copy(tag[k + '_OPT'].languageCode);
						delete entry.localizedTextModel.tagId;
						delete entry.localizedTextModel.localizedTextId;
						postOBJ.push($http.put(cfg.tags.SVC_URI + '/' + tagId + '/lang/' + tag[k + '_OPT'].localizedTextId, entry));
					}
					else {
						entry = {localizedTextModel:{languageCode:k, text:tag[k]}};
						postOBJ.push($http.post(cfg.tags.SVC_URI + '/' + tagId + '/lang', entry));					
					}
				}
			}		
			return $q.all(postOBJ).then(function(data){
			  }, function(response) {
			});
		},
		// delete
		delete: function(id) {			
			return $http.delete(cfg.tags.SVC_URI + '/' + id)
			.success(function(data, status) {	
				console.log('delete successful')			
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: RatesService.delete() returned with status ' + status);
			});
		}		
	};
});