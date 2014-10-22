'use strict';

angular.module('time')
  .controller('TreeCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	
	$scope.people = [{'firstname':'Peter', 'lastname':'Windemann', 'id':'007'}, {'firstname':'Bruno', 'lastname':'Kaiser', 'id':'001alpha'}, {'firstname':'Thomas', 'lastname':'Huber', 'id':'123-KK'}];
	$scope.client = [{'companyname':'UBS AG', 'id':'007'}, {'companyname':'Credit Suisse AG', 'id':'001alpha'}, {'companyname':'Julius Bär AG', 'id':'123-KK'}];		
	 $scope.opened=[];
  $scope.open = function($event, openid) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened[openid] = true;
  };


	//*********************** Table ********************	
	$scope.getConfig=function(){
		var rowConfig = [
			{"title":"Date", "type":"date", "value":""},
			{"title":"Hours", "type":"time", "value":""},
			{"title":"Person", "type":"peopleselect", "value":""},
			{"title":"Comment", "type":"text", "value":""},
			{"title":"Test", "type":"text", "value":""}
			]
		return rowConfig;		
		}
	$scope.tableValues={"rows":[]};
	$scope.tableValues.rows.push($scope.getConfig())
	$scope.logRow=function(){
		console.log($scope.tableValues)
		}
	$scope.addRow=function(){
		$scope.tableValues.rows.push($scope.getConfig())
		}
	$scope.tableRemove=function(row){
		delete $scope.tableValues.rows[row]
		}
	$scope.tableCopy=function(row){
		var rowConfig=$scope.getConfig();
		for (var i = 0, len = rowConfig.length; i < len; i++) {
				rowConfig[i].value=$scope.tableValues.rows[row][i].value;
			}			
		$scope.tableValues.rows.push(rowConfig)
		}
	//************************************** Single Select ****************************************
	$scope.selectPerson = function(data){
		$scope.PeopleSelect=data;
		}
	$scope.removePerson = function() {$scope.PeopleSelect=undefined}	

	$scope.logPerson = function(){
		console.log($scope.PeopleSelect)
		}

	//************************************** Select Multiple **************************************
	$scope.MultiplePeople=[]
	$scope.removeMultiPerson = function() {$scope.MultiplePeople=[]}
	$scope.removeMultiSinglePerson = function(data){
		$scope.deleteExistingMulti(data);
		}
	//delete element from array of objects
	$scope.deleteExistingMulti = function(data) {
		for (var i = 0, len = $scope.MultiplePeople.length; i < len; i++) {
			if ($scope.MultiplePeople[i]["id"]== data.id) {
				$scope.MultiplePeople.splice(i, 1);
				break;
				}
			}	
		}
	//check if element exists in array of objects
	$scope.checkExistingMulti = function(data) {
		var checkVar=true;
		for (var i = 0, len = $scope.MultiplePeople.length; i < len; i++) {
			if ($scope.MultiplePeople[i]["id"]== data.id) {
				checkVar=false;
				break;
				}
			}	
		return checkVar; 		
		}
	$scope.updatePeople = function (data){
		if($scope.checkExistingMulti(data)) $scope.MultiplePeople.push(data)
		$scope.MultiPeopleSelect=undefined;
		}	
	$scope.selectMultiPerson = function(data){
		if($scope.checkExistingMulti(data)) $scope.MultiplePeople.push(data)
		}		
	$scope.logMultiPerson = function(){
		console.log($scope.MultiplePeople)
		}
						
	//************************************** Tree **************************************
    $scope.delete = function(data) {
        data.nodes = [];
    };
    $scope.add = function(data) {
        var post = data.nodes.length + 1;
        var newName = data.name + '-' + post;
        data.nodes.push({name: newName, expanded:true, nodes: []});
    };
    $scope.collapse = function(data) {
         data.expanded=false;   
    }
    $scope.expand = function(data) {
         data.expanded=true;   
    }
    $scope.tree = [{name: "Node", expanded:true, nodes: []}];
	$scope.savelog = function(){
		console.log($scope)
		}

	//*************************************** Dependency Select *****************************
	var option1Options = ["UBS AG", "Credit Suisse AG", "Julius Bär AG"];
	var option2Options = [
		["Projekt UBS 1","Projekt UBS 2","Projekt UBS 3"], 
		["Projekt Credit Suisse 1","Projekt Credit Suisse 2","Projekt Credit Suisse 3"], 
		["Projekt Julius Bär 1","Projekt Julius Bär 1","Projekt Julius Bär 1"]
		];
	$scope.options1 = option1Options;
	$scope.options2 = []; 
	$scope.getOptions2 = function(){
		var key = $scope.options1.indexOf($scope.option1);
		var myNewOptions = option2Options[key];
		$scope.options2 = myNewOptions;
		};
		
	$scope.ClientProjects=[
		{
				"name":"UBS AG", 
				"id":"1001", 
				"projects":[
					{
						"name":"Project UBS AG 1", 
						"id":"3001", 
						"subprojects":[
							{
								"name":"Sub-Project UBS AG 1", 
								"id":"5001"
							},
							{
								"name":"Sub-Project UBS AG 2", 
								"id":"5001a"
							}
						]
					}
				]
			},
		{
				"name":"Credit Suisse AG", 
				"id":"1002", 
				"projects":[
					{
						"name":"Credit Suisse AG 1", 
						"id":"3002", 
						"subprojects":[
							{
								"name":"Sub-Project Credit Suisse AG 1", 
								"id":"5002"
							},
							{
								"name":"Sub-Project Credit Suisse AG 2", 
								"id":"5002a"
							}
						]
					}
				]
			}
		]
  })