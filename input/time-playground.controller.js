'use strict';

angular.module('time')
  .controller('TimePlaygroundCtrl', function ($scope, $modal, $http, cfg) {
	cfg.GENERAL.CURRENT_APP = 'time';

    //Tabs
    var counter = 1;
    $scope.tabs = [];

    var addTab = function () {            
        if(counter % 2 === 0){$scope.tabs.push({ title: 'Tab ' + counter, temp:'gridTemp'});}
        else{$scope.tabs.push({ title: 'Tab ' + counter, temp:'gridTemp2'});}
        counter++;
        $scope.tabs[$scope.tabs.length - 1].active = true;
    };

    var removeTab = function (event, index) {
      event.preventDefault();
      event.stopPropagation();
      $scope.tabs.splice(index, 1);
    };

    $scope.addTab    = addTab;
    $scope.removeTab = removeTab;

    for (var i = 0; i < 3; i++) {
      addTab();
    }    



    $scope.timeOPT={item:[]};
    //TODO: New Service
    $scope.structure = [
        {"field":"firstName", "name":"Vorname", "dataType": "String"},
        {"field":"lastName", "name":"Nachname", "dataType": "String"},
        {"field":"company", "name":"Arbeitgeber", "dataType": "String"}
    ];              
    $scope.rowActions={
        edit:'<button type="button" class="btn btn-xs btn-primary" ng-click="grid.appScope.gridAction(row, 2)"><i class="fa fa-pencil"></i></button>',
        remove:'<button type="button" class="btn btn-xs btn-primary" ng-click="grid.appScope.gridAction(row, 3)"><i class="fa fa-trash-o"></i></button>',
        add:'<button type="button" class="btn btn-xs btn-primary" ng-click="grid.appScope.gridAction(row, 1)"><i class="fa fa-plus"></i></button>',
        dragdrop:'<div type="button" class="btn btn-xs btn-primary cursor-drag" ng-model="test1" data-drag="true" jqyoui-draggable data-jqyoui-options="{revert: true, appendTo: \'body\', helper:\'clone\'}"><i class="fa fa-arrows"></i></div>'
    }; 
    $scope.startCallback = function(event, ui) {
        ui.helper[0].textContent="Test"
    };
    $scope.rowTemplate= {field:'actions', name:'', cellTemplate:'', enableSorting: false, enableFiltering: false};

    //Simple Grid
    $scope.gridStructure = angular.copy($scope.structure);
    $scope.gridStructure.unshift(angular.copy($scope.rowTemplate));
    $scope.gridStructure[0].cellTemplate = '<div class="ui-grid-cell-contents">' + $scope.rowActions.edit + ' ' + $scope.rowActions.dragdrop + '</div>';
    $scope.gridStructure[0].width = 62;

    $scope.gridOptions={
        enableFiltering: true,
        enableColumnMenus: false      
    };    
    $scope.gridOptions.columnDefs = $scope.gridStructure;
    $scope.gridOptions.data = [
    {
        "id":"Test123",
        "firstName": "Cox",
        "lastName": "Carney",
        "company": "Enormo",
    },
    {
        "id":"Test1234",
        "firstName": "Lorraine",
        "lastName": "Wise",
        "company": "Comveyer",
    },
    {
        "id":"Test1235",
        "firstName": "Nancy",
        "lastName": "Waters",
        "company": "Fuelton",
    }
    ];

    //Treeview
    $scope.gridOptions2={
            enableSorting: false,
            enableFiltering: false,
            enableColumnMenus: false,
            treeViewIndent:20
        };    
    $scope.gridStructure2 = angular.copy($scope.structure);
    $scope.gridStructure2.unshift(angular.copy($scope.rowTemplate));  
    $scope.gridStructure2[0].cellTemplate = '<div class="ui-grid-cell-contents">' + $scope.rowActions.edit + ' ' + $scope.rowActions.remove + ' ' + $scope.rowActions.add + '<div>';
    $scope.gridStructure2[0].width = 90;

    $scope.gridOptions2.columnDefs = $scope.gridStructure2;    
    var data=[];
    for(var i=0;i<5000;i++){
        data.push({id:"Test"+i,        firstName: "First "+i,        lastName: "Last "+i,        company: "Comapny "+i,  $$treeLevel: 0 });
        }
    $scope.gridOptions2.data = data;


    $scope.gridAction = function(row, action){//1=add, 2=edit, 3=delete
        $scope.timeOPT.item=row;
        $scope.data=angular.copy(row.entity);
        var modalInstance = $modal.open({
            size:'lg',
            controller: function($scope, $modalInstance, data, structure){
                if(action==1) {
                    $scope.data={};
                }
                else {
                    $scope.data=data;
                }
                $scope.structure=structure;

                $scope.resolveName = function(key){
                    var index = $scope.structure.map(function(e) { return e.field;}).indexOf(key);
                    return $scope.structure[index].name;
                };
                $scope.close = function(){
                    modalInstance.dismiss('cancel'); 
                };
                $scope.ok = function(){
                    modalInstance.close($scope.data);                                                                                        
                };
            },
            resolve: {
                data: function () {return $scope.data;}, 
                structure: function () {return $scope.structure;}
            },
            template: function(){
                var HTML='';
                if(action==1) {
                    HTML+='<div class="modal-header"><button type="button" class="close" ng-click="close()">×</button><h3 class="modal-title">Neuer Eintrag</h3></div>';
                    HTML+='<div class="modal-body">';
                    HTML+='<form class="form-horizontal">';                    
                    HTML+='<div class="form-group" ng-repeat="item in structure">';                
                    HTML+='<div class="col-sm-2"><label>{{item.name}}</label></div>';     
                    HTML+='<div class="col-sm-10"><input type="text" class="form-control" ng-model="data[item.field]"></div>';   
                    HTML+='</div>';
                    HTML+='</form>';
                    HTML+='</div>'; 
                    HTML+='<div class="modal-footer"><button class="btn btn-primary pull-left" ng-click="ok()"><i class="fa fa-cloud-upload margin-right-SM"></i>Speichern</button><button class="btn btn-default" ng-click="close()"><i class="fa fa-times margin-right-SM"></i>Abbrechen</button></div>';                   
                }                
                if(action==2) {
                    HTML+='<div class="modal-header"><button type="button" class="close" ng-click="close()">×</button><h3 class="modal-title">Eintrag bearbeiten</h3></div>';
                    HTML+='<div class="modal-body">';
                    HTML+='<form class="form-horizontal">';                    
                    HTML+='<div class="form-group" ng-repeat="(key, value) in data" ng-if="key!==\'id\'">';                
                    HTML+='<div class="col-sm-2"><label>{{resolveName(key)}}</label></div>';     
                    HTML+='<div class="col-sm-10"><input type="text" class="form-control" ng-model="data[key]"></div>';   
                    HTML+='</div>';
                    HTML+='</form>';
                    HTML+='</div>'; 
                    HTML+='<div class="modal-footer"><button class="btn btn-primary pull-left" ng-click="ok()"><i class="fa fa-cloud-upload margin-right-SM"></i>Speichern</button><button class="btn btn-default" ng-click="close()"><i class="fa fa-times margin-right-SM"></i>Abbrechen</button></div>';                   
                }
                if(action==3) {
                    HTML+='<div class="modal-header"><button type="button" class="close" ng-click="close()">×</button><h3 class="modal-title">Eintrag löschen?</h3></div>';
                    HTML+='<div class="modal-body">';
                    HTML+='<form class="form-horizontal">';                    
                    HTML+='<div class="form-group" ng-repeat="(key, value) in data" ng-if="key!==\'id\'">';
                    HTML+='<div class="col-sm-2"><label>{{resolveName(key)}}</label></div>';
                    HTML+='<div class="col-sm-10">{{data[key]}}</div>';                    
                    HTML+='</div>';
                    HTML+='</form>';
                    HTML+='</div>'; 
                    HTML+='<div class="modal-footer"><button class="btn btn-primary pull-left" ng-click="ok()"><i class="fa fa-trash-o margin-right-SM"></i>Löschen</button><button class="btn btn-default" ng-click="close()"><i class="fa fa-times margin-right-SM"></i>Abbrechen</button></div>';
                }

                return HTML;
            }
        });
        modalInstance.result.then(function (data) {
        
            if(action==1) {
                if($scope.data.$$treeLevel !== undefined){                    
                    data.$$treeLevel=$scope.data.$$treeLevel+1;     
                    data.id=Math.random().toString(36).substring(7); //Get from server               
                    var index = $scope.gridOptions2.data.map(function(e) { return e.id;}).indexOf($scope.data.id)+1;
                    console.log(index)
                    $scope.gridOptions2.data.splice(index,0, data);
                }
                else {
                    $scope.gridOptions.data.unshift(data);
                }                
            }            
            if(action==2) {
                $scope.timeOPT.item.entity = data;
            }
            if(action==3) {
                var index = $scope.gridOptions.data.map(function(e) { return e.id;}).indexOf(data.id);
                $scope.gridOptions.data.splice(index,1);
            }            
        });
    };

});
