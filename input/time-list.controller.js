'use strict';

angular.module('time')
  .controller('TimeListCtrl', function ($scope, $filter, $http, $log, cfg) {
	cfg.GENERAL.CURRENT_APP = 'time';
	$log.log('TimeListCtrl/cfg = ' + JSON.stringify(cfg, null, '\t'));
	
	$scope.treeOPT=
	{
		addeditShow: false, 
		deleteShow: false, 
		tmpobj: '', 
		tmpindex: 0, 
		tmppeople: [], 
		peopleselect: [], 
		catName: '', 
		treeitemDesc: '', 
		treeAction: '', 
		treePeopleView: 0, 
		items: {}
	};

	$scope.getTree = function() {
		var _listUri = '/api/wtt/getmockedtree';
		$http.get(_listUri)
		.success(function(data, status) {
			$log.log('time-list.controller: **** SUCCESS: GET(' + _listUri + ') returns with ' + status);
	    	// $log.log('data=<' + JSON.stringify(data) + '>');
	    	$scope.treeOPT.items = data;
		})
		.error(function(data, status) {
	  		// called asynchronously if an error occurs or server returns response with an error status.
	    	$log.log('time-list.controller: **** ERROR:  GET(' + _listUri + ') returns with ' + status);
	    	// $log.log('data=<' + JSON.stringify(data) + '>');
	  	});
	};

	$scope.getTree();
	$scope.treeCompany=[];
	$scope.treeNew=[];
	$scope.timeUpdate = function(item){
		$scope.timeCompany=item;
		$scope.treeTable = item.categories;
		};
	$scope.treeNewentry = function (item) {
		$scope.treeNew.push({'cmpid':$scope.timeCompany.id, 'cmptitle':$scope.timeCompany.title, 'prjid':item.id, 'prjtitle':item.title, 'date':'','time':'', 'comment':''});
		};
	//Datepicker
	$scope.opened=[];
	$scope.open = function($event, openid) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened[openid] = true;
		};	
	$scope.formatedate = function (obj){
		//Callend whenever a date is selected. Because the date is stored unformatted, when performing a row-copy, the datepicker date gets rewritten with unformatted date. 
		obj.date = $filter('date')(obj.date, 'dd.MM.yyyy');
		};
	//DUPLICAZE FORM TREE_INPUT		
	$scope.treeInputTableCopy = function(obj, index){
		$scope.treeNew.splice(index, 0, angular.copy(obj)); //from http://stackoverflow.com/questions/19333023/ngmodel-reference-when-pushed-into-array
		};
	$scope.treeInputTableRemove = function(index){
		$scope.treeNew.splice(index, 1);
		};				
  });