'use strict';

angular.module('time')
  .controller('TimeTagsCtrl', function ($scope, cfg, TagsService, alertsManager) {
	//Get Rates
	$scope.tagsOPT={tagsLoaded:0, tags:[]};	
	$scope.tagsStructure=[];
	var tagsList = function(){
		TagsService.list().then(function(result) {	
			var i, id, index, tmp;			
			for(i=0;i<result.data.singleLangTag.length;i++){
				id=result.data.singleLangTag[i].tagId;
				index=$scope.tagsOPT.tags.map(function(a){return a.id}).indexOf(id);
				if(index===-1){
					tmp={id:id};
					tmp[result.data.singleLangTag[i].languageCode]=result.data.singleLangTag[i].text;
					tmp[result.data.singleLangTag[i].languageCode + '_OPT']=result.data.singleLangTag[i];
					$scope.tagsOPT.tags.push(tmp);
				}
				else{
					$scope.tagsOPT.tags[index][result.data.singleLangTag[i].languageCode]=result.data.singleLangTag[i].text;
					$scope.tagsOPT.tags[index][result.data.singleLangTag[i].languageCode + '_OPT']=result.data.singleLangTag[i];
				}
			}		
			$scope.tagsStructure=[
				{ name:'Deutsch', field: 'DE', inputType:'text'},		
				{ name:'Englisch', field: 'EN', inputType:'text'},
				{ name:'Französisch', field: 'FR', inputType:'text'}
			];
			$scope.tagsOPT.tagsLoaded=1;
		}, function(reason) {//error
			alertsManager.addAlert('Could not get tags. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		}); 
	}
	tagsList();
	//Handle Directive Call
	$scope.tagsFunction = function (action, param, data){
		if(action===2){//Save new
			tagNewSave(param);
		}
		if(action===3){//Edit Save
			tagsEditSave(param);
		}
		if(action===4){//Remove
			tagsEditRemove(param);
		}					
	};

	//Save Tags -> New
	var tagNewSave = function(param){	
		TagsService.createId().then(function(result) {
			var id=result.data.tagModel.id;
			TagsService.saveEntry(param, id).then(function(result) {
				tagsList();		
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not create tag. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
			});			
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not create tag id. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});		
	};
	//Save Tags -> Edit
	var tagsEditSave = function(param){
		TagsService.saveEntry(param, param.id).then(function(result) {
			tagsList();
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not update tag. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		}); 		
	};
	//Delete Rates
	var tagsEditRemove = function(param) {
		TagsService.delete(param.id).then(function(result) {
			var index = $scope.tagsOPT.tags.map(function(a){return a.id}).indexOf(param.id);
			if(index!==-1){
				$scope.tagsOPT.tags.splice(index, 1);
			}
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not delete rate. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
		}); 
	};	
 });