'use strict';
angular.module('core')
//Quick Entry of Time
.directive('timeQuickEntry', function(ResourcesService, alertsManager){	
	return {
		restrict: "A",
		replace:true,
		scope: {},
		template: function(e, attr){
			var html='';
			html+='<div class="clearfix">';
			html+='		<script id="recursion.html" type="text/ng-template">';
			html+='			<a href="javascript:void(0)" ng-click="projectSelect(obj.id, obj.title)">{{obj.title}}</a>';
			html+='			<ul ng-if="obj.projects.length" class="dropdown-menu">';
			html+='				<li ng-repeat="obj in obj.projects" ng-class="{\'dropdown-submenu\':obj.projects.length}" ng-include="\'recursion.html\'"></li>';
			html+='			</ul>'
			html+='		</script>';
			html+='		<div class="clearfix">';
			html+='			<input type="text" class="form-control width150 pull-left margin-right-S margin-bottom-S" ng-model="company" typeahead="company as company.title for company in companies | filter:$viewValue | limitTo:8" typeahead-min-length="3" typeahead-on-select="loadProjects($item)" placeholder="Firma">';
	        html+='     	<div class="dropdown pull-left margin-right-S margin-bottom-S" ng-if="projects" dropdown>';
	        html+='				<button type="button" class="btn btn-default" dropdown-toggle>{{projectTitle}} <span class="caret" ng-if="projects.length"></span></button>';
	        html+='        		<ul class="dropdown-menu multi-level" role="menu" aria-labelledby="dropdownMenu">';
	        html+='           		<li ng-repeat="obj in projects" ng-class="{\'dropdown-submenu\':obj.projects.length}" ng-include="\'recursion.html\'"></li>';
	        html+='				</ul>';
	        html+='			</div>'	        
	        html+='		</div>';
	        html+='		<form name="quickTimeForm" ng-if="showDateTime" class="margin-bottom-S form-inline animate-enter">';
	        html+='			<input type="text" class="form-control width100 margin-bottom-S pull-left" datepicker-popup="dd.MM.yyyy" ng-model="entry.date" ng-click="open($event, 0)" is-open="opened[0]" placeholder="Datum" required>';
	        html+='			<div class="pull-left margin-left-S">';
	        html+='				<div arbalo-time-input model="entry" time-required="true"></div>';
	        html+='			</div>';
	        html+='			<button class="btn btn-primary margin-left-S" ng-disabled="quickTimeForm.$invalid" ng-click="submitForm()"><span class="fa fa-check"></span></button>';
	        html+='		</form>';
	        html+='</div>';
			return html;
		},
		controller: function($scope, ResourcesService){
 			$scope.quickentryOPT={companies:null, projects:null, projectTitle:'Projekte', showDateTime:false} 			 			 			
 			$scope.entry={cmpid:null, prjid:null, date:'', time:'', comment:''};
				ResourcesService.listCompanies().then(function(result) {
			   		$scope.companies = result.data.companyModel;
			   		}, function(reason) {//error
				       		
			  	});				
		  	$scope.loadProjects=function(obj)	{
				ResourcesService.listProjectsTree(obj.id).then(function(result) {
					var data = result.data.projectTreeNodeModel;
					$scope.projects = data.projects;					
					if($scope.projects.length){
						$scope.projectTitle= 'Projekte';
						$scope.entry.cmpid=obj.id;	
					}
					else {
						$scope.projectTitle= 'Keine Projekte';
					}
					$scope.showDateTime=false;
					emptyForm();
			       	}, function(reason) {//error

			  	});	
		  	};
		  	$scope.projectSelect=function(id, title){
		  		$scope.projectTitle=title;
		  		$scope.entry.prjid=id;
		  		emptyForm();
		  		$scope.showDateTime=true;
		  	};
		  	var emptyForm=function(){
		  		$scope.entry.date=new Date();
		  		$scope.entry.time='';
		  		$scope.entry.comment='';		  				  	
		  	};
		  	$scope.submitForm=function(){
		  		console.log('submit');
		  		emptyForm();
				$scope.projectTitle= 'Projekte';
				$scope.entry.prjid=null;		  		
		  		$scope.showDateTime=false;
		  		alertsManager.addAlert('Eintrag gespeichert. ', 'success', 'fa-check', 1);
		  	};
		  	//Datepicker
			$scope.opened=[];
			$scope.open = function($event, openid) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.opened[openid] = !$scope.opened[openid]
			};
		}
	};	
})
//*****************************************************************************************************************************************************
//*********************************************************************** Time Input Field ************************************************************
//*****************************************************************************************************************************************************
.directive('arbaloTimeInput', function($modal, ResourcesService, TimeService){
	return {
		restrict: "A",
		replace:true,
		scope:{
			model:'=',
			timeRequired:'@',
			timeChangeFn:'&',
			timeChangeAttr:'=',
			timeDelete:'@',
			watch:'@arbaloWatch'
		},
		template:function(e, attr){
			var html='<div>';
			html+='<form name="myform" class="form-inline">'; 
			html+='<div class="form-group">' ;
			html+='<div class="input-group">';
			html+='<input type="text" class="form-control" name="time_field" ng-model="model.time" placeholder="Zeit" ng-change="validate(model)" ng-model-options="{ debounce: 500 }" ' + (attr.timeRequired ? 'required' : '') + '>';
			html+='<div class="input-group-addon" ng-if="model.duration">{{model.duration}}</div>';
		    html+='<span class="input-group-btn">';
		    html+='<button class="btn btn-default" type="button" ng-click="obj.$$more=!obj.$$more"><i class="fa fa-ellipsis-v"></i></button>';
		    html+='</span>';
			html+='</div>';
			html+='</div>';
			html+='<div class="input-help" ng-if="obj.err"><strong>Format</strong><table><tr><td>Von-Bis</td><td>1000-1200 oder 10-12</td></tr><tr><td>Von Stunden</td><td>1000 2.5 oder 10 2.5</td></tr></table></div>';
			html+='<div>';			
			html+='<div ng-if="obj.$$more" class="position-relative">';
			html+='<textarea class="form-control margin-top-S margin-bottom-S" ng-model="model.comment" placeholder="Kommentar"></textarea>';						
			html+='<div arbalo-tags display="Tags" model="model.tagRef"></div>';			
			html+='<input id="id_{{rand}}" type="checkbox" ng-model="model.isBillable"><label class="customCheckbox" for="id_{{rand}}">Verrechenbar</label>';
			if(attr.timeDelete==='true'){
				html+='<a class="position-bottom-right-S" ng-click="setDeleted(model)"><i class="fa fa-trash-o"></i></a>';
			}
			html+='</div>';
			html+='</div>';
			html+='</form>';
			html+='</div>';
			return html;
		},		
		controller: function($scope){
			$scope.obj={err:0}
			$scope.rand=Math.random().toString(36).substring(7);
			$scope.validate = function(t){
				var res=TimeService.validateTime(t.time);			
				$scope.obj.err=1;
				if(!res){					
					return false;
				}		
				$scope.obj.err=0;		
				t.duration=res.duration;
				t.$$changed=1;
				if($scope.timeChangeFn){
					$scope.timeChangeFn({item:$scope.model, attr:$scope.timeChangeAttr});
				}				
			};
			$scope.setDeleted = function(item){
				item.$$deleted=1;				
				if($scope.timeChangeFn){
					$scope.timeChangeFn({item:$scope.model, attr:$scope.timeChangeAttr});
				}				
			};
			if($scope.model.time && $scope.model.time!==''){
				$scope.validate($scope.model)
			};
			if($scope.watch==='true'){//If watch is enabled directive watches for model changes and updates (e.g. Calendar click on differnet events that change time)
				$scope.$watch("model", function(newValue, oldValue){					
					if(newValue && newValue.time){
	    				$scope.validate(newValue);
	    			}
				});
			}		
		}
	}
})
//*****************************************************************************************************************************************************
//*********************************************************************** Project Selection ***********************************************************
//*****************************************************************************************************************************************************
.directive('arbaloProjectSelect', function($modal, ResourcesService){
	return {
		restrict: "A",
		replace:true,
		scope:{
			company:'=',
			project:'='
		},
		template:function(){
			var HTML='<div>';
			HTML+='<input type="text" class="form-control width160" ng-model="company" typeahead="company as company.title for company in projectselOPT.companies | filter:$viewValue | limitTo:8" typeahead-min-length="3" typeahead-on-select="loadProjects($item)" placeholder="Firma">';
			HTML+='<div ng-if="company.id" class="margin-top-SM input-group width160">';			
			HTML+='<span class="input-group-btn">';
			HTML+='<button type="button" class="btn btn-default" ng-click="openProjectModal()"><i class="fa fa-sitemap"></i></button>';			
			HTML+='</span>';
			HTML+='<input type="text" class="form-control" ng-if="project.title" ng-model="project.title" readonly="readonly">';
			HTML+='</div>';
			HTML+='</div>';
			HTML+='</div>';
			return HTML;
		},		
		controller: function($scope){
 			$scope.projectselOPT={companies:[], projects:[], projectsSel:[]};
				ResourcesService.listCompanies().then(function(result) {
			   		$scope.projectselOPT.companies = result.data.companyModel;			   		
			   		}, function(reason) {//error				       	
			  	});
			$scope.loadProjects = function(item){	
				ResourcesService.listProjectsTree(item.id).then(function(result) {									
					$scope.projectselOPT.projects=result.data.projectTreeNodeModel.projects;					
				}, function(reason) {//error
							
				});
			}
			//company Alreaady loaded?
			if($scope.company && $scope.company.id){
				$scope.loadProjects($scope.company);
			}			
			$scope.openProjectModal = function(){
				var selectedCompany = angular.copy($scope.company);
				var projects = $scope.projectselOPT.projects
		        var modalInstance = $modal.open({
		            size:'lg',
		            animation :false, //BUG: https://github.com/angular-ui/bootstrap/issues/3620 and https://github.com/angular-ui/bootstrap/issues/3633
		            controller: function($scope){
		            	$scope.modalOPT={company:selectedCompany, projects:projects, projectSel:[]};
		            	$scope.selectNode = function(item){
		            		item.childrenVisible=!item.childrenVisible;            				
		            	};
	
		                $scope.close = function(){		                	
		                    modalInstance.dismiss('cancel');
		                };	
		                $scope.ok = function(item){
		                	modalInstance.close(item); 
		                }                		               									              		                
		            },
		            template: function(){		            	
		                var html='';
	                    html+='<div class="modal-header"><button type="button" class="close" ng-click="close()">×</button><h3 class="modal-title">{{modalOPT.company.title}}: Projekte</h3></div>';
	                    html+='<div class="modal-body">';
	                    html+='<div class="tree-simple" ng-repeat="e in modalOPT.projects" ng-init="e.childrenVisible=true">';
	                    html+='<ul>';
	                    html+='<li class="treenode">';
	                    html+='<a ng-click="e.childrenVisible=!e.childrenVisible"><i class="fa" ng-class="{\'fa-folder-open\':e.childrenVisible, \'fa-folder\':!e.childrenVisible, }"></i></a>';
	                    html+='<a ng-click="ok(e)">{{e.title}}</a>';	                   
	                    html+='<div ng-if="e.projects && e.childrenVisible" arbalo-tree-directive source="e.projects" update="ok(item)"></div>';
	                    html+='</li>';
	                    html+='</ul>';
	                    html+='</div>';
	                    html+='</div>'; 
	                    html+='<div class="modal-footer"><button class="btn btn-default" ng-click="close()"><i class="fa fa-times margin-right-SM"></i>Abbrechen</button></div>';                   
		                return html;
		            }
		        });
				modalInstance.result.then(function (data) {	
					$scope.project={id:data.id, title:data.title};					
				});
			}
		}
	}
})
.directive("arbaloTreeDirective", function($compile) {
    return {
        restrict: "A",
        replace:true,
        scope: {
        	source: '=',
        	update:'&'
        },
        template: function(){
        	var html='<ul>';
            html+='<li class="treenode" ng-repeat="e in source" ng-init="e.childrenVisible=true">';
            html+='<a ng-click="e.childrenVisible=!e.childrenVisible"><i class="fa" ng-class="{\'fa-folder-open\':e.childrenVisible, \'fa-folder\':!e.childrenVisible, }"></i></a>';
            html+='<a ng-click="update({item:e})">{{e.title}}</a>';
            html+='<div ng-if="e.projects && e.childrenVisible" arbalo-tree-directive source="e.children" update="update({item:item})"></div>';
            html+='</li>';
        	html+='</ul>';
            return html;
        },
        compile: function(tElement, tAttr) {
            var contents = tElement.contents().remove();
            var compiledContents;
            return function(scope, iElement, iAttr) {
                if(!compiledContents) {
                    compiledContents = $compile(contents);
                }
                compiledContents(scope, function(clone, scope) {
                         iElement.append(clone); 
                });
            };
        }
    };
})
//*****************************************************************************************************************************************************
//*********************************************************************** DATA GRID DIRECTIVE *********************************************************
//*****************************************************************************************************************************************************
.directive('arbaloGrid', function($modal, $http, $log, uiGridConstants, uiGridTreeViewConstants){	
	return {
		restrict: "A",
		replace:true,
		scope: {
			treeView:'@',
			treeNodereload:'@',
			title:'@',
			source:'=',
			structure:'=',
			actions:'@',
			rowClick:'@',
			fn:'&',
			canUpdate:'@',
			customHeaderSettings:'=',
			customHeaderAction:'&',
			customActionSettings:'=',
			customActionFunction:'&',
			rowDraggable:'@',
			rowDroppable:'@'
		},
		template: function(e, attr){					
			var html='';
			html+='<div class="clearfix">';
			html+='<div class="grid-header-custom clearfix">';
			html+='<div class="pull-left grid-header-custom-text">{{title}}</div>';		
			html+='<div class="pull-right pointer grid-header-custom-icons">';
			if(attr.treeView!=="true") {
				html+='<a ng-click="toggleFiltering()" class="text-black" title="Search"><i class="fa fa-search"></i></a>';
			}	
			html+='<a ng-if="editGrid" ng-click="exportCSV()" class="text-black margin-left-L" title="Download CSV"><i class="fa fa-download"></i></a>';			
			if(attr.customHeaderSettings) {
				html+='<a ng-repeat="header in customHeaderSettings" ng-click="header.action()" class="text-black margin-left-L" ng-class="{\'border-bottom-color\' : header.active}"><i ng-class="header.icon"></i></a>';
			}
			if(attr.actions.indexOf('A')!==-1){
				html+='<a ng-if="editGrid" ng-click="gridAction(0, 1)" class="text-black margin-left-L" title="Add"><i class="fa fa-plus"></i></a>';
			}			
			if(attr.actions.indexOf('A')!==-1 || attr.actions.indexOf('E')!==-1 || attr.actions.indexOf('D')!==-1){
				html+='<a ng-click="toggleEdit()" class="text-black margin-left-L"  title="Toggle Edit"><i ng-if="editGrid" class="fa fa-toggle-on"></i><i ng-if="!editGrid" class="fa fa-toggle-off"></i><i class="margin-left-M fa fa-pencil"></i></a>';
			}
			html+='</div>';				
			html+='</div>';
			html+='<div ui-grid="gridOptions" class="uiGrid" ui-grid-exporter';
			if(attr.treeView==="true") {
				html+=' ui-grid-tree-view';
			}
			if(attr.rowClick==="true") {
				html+=' ui-grid-selection';
			}			
			html+='></div> ';
	        html+='</div>';
			return html;
		},
		controller: function($scope, $element, $attrs){
			$scope.editGrid=0; //Edit of Grid On-Off
			$scope.isTree =  $scope.treeView==='true' ? 1 : 0; //If Grid is a Tree
			$scope.isTreeNodeReload = $scope.treeNodereload==='true' ? 1 : 0; //Depreciated -> Nachladne des Nodes
			$scope.isRowClick=$scope.rowClick==='true' ? 1 : 0; //Click on row enabled 
			$scope.isUpdate=$scope.canUpdate==='true' ? 1 : 0; //Can the model change in parent scoipe and updagte grid
			if($scope.isUpdate){
				$scope.$watch("source", function(newValue, oldValue){ //Watch because link to parent scope via source not working
	    			$scope.gridOptions.data=newValue;
				});	
			}	
			$scope.toggleEdit=function(){
				if($scope.isRowClick){//Disable Row Click in Edit Mode
					$scope.gridOptions.enableRowSelection = $scope.editGrid;
					$scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.OPTIONS);
				}
				$scope.editGrid = !$scope.editGrid;
				var colIndex=$scope.colStructure.length - 1;
			    $scope.colStructure[colIndex].visible = !($scope.colStructure[colIndex].visible || $scope.colStructure[colIndex].visible === undefined);
			    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);				
			};
			$scope.toggleFiltering = function(){
				$scope.gridOptions.enableFiltering = !$scope.gridOptions.enableFiltering;
				$scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
			};	
			$scope.exportCSV = function(){
		      var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
		      $scope.gridApi.exporter.csvExport( 'all', 'all', myElement );				
			};	
			$scope.gridOptions={
				enableColumnMenus: false,
				treeViewIndent:20,
				rowHeight: 40,	
			    enableSorting: true,
			    data: $scope.source,
				onRegisterApi: function( gridApi ) {
	 				$scope.gridApi = gridApi;
	 				if($scope.isTree) {//Treeview: 
	 					if($scope.isTreeNodeReload) {//Expand rows, load additional data
			          		$scope.gridApi.treeBase.on.rowExpanded($scope, function(row) {
			          			$scope.fn({action:1, param:row.entity, data:0});
			          		});
		          		}
		          		else {

		          		}
		          	}
				}
			};
			//Row Click Template
			if($scope.isRowClick){
				$scope.gridOptions.rowTemplate='<div ';
				if($scope.rowDraggable)	{ //DRAG
					$scope.gridOptions.rowTemplate+='data-drag="true" data-jqyoui-options="{appendTo: \'body\',  helper: \'clone\'}" ng-model="row" jqyoui-draggable="{placeholder:\'keep\'}" ';
				}
				if($scope.rowDroppable)	{ //DROP
					$scope.dropOBJ={drag:null, drop:null};
					$scope.assignDrop=function(e){
						$scope.dropOBJ.drop=e;
					}				
					$scope.$watch("dropOBJ.drag", function(newValue, oldValue){					
						if(newValue && newValue.entity){
							$scope.fn({action:5, param:$scope.dropOBJ, data:0});	
						}
					});	
					$scope.gridOptions.rowTemplate+='data-drop="true" ng-model="grid.appScope.dropOBJ.drag" jqyoui-droppable="{onDrop:grid.appScope.assignDrop(row)}" '; //HACK: without \'\' otherwise drop is not firing, $scope.watch neccessary as onDrop executed before ng-model updates
				}	
				if($scope.isRowClick){
					$scope.gridOptions.rowTemplate+='ng-click="grid.appScope.rowClickTransmit(row)"	';
				}			
				$scope.gridOptions.rowTemplate+='ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell pointer" ng-class="{\'ui-grid-row-header-cell\': col.isRowHeader, \'ui-grid-click\': !grid.appScope.editGrid }" ui-grid-cell></div>';
				$scope.gridOptions.enableRowSelection = true;
				$scope.gridOptions.enableRowHeaderSelection = false;
				$scope.gridOptions.multiSelect = false;
			}
			$scope.rowClickTransmit=function(row){
				$scope.fn({action:21, param:row, data:$scope.title});
			}
			//Structure
			var structure = $scope.structure
			$scope.colStructure=angular.copy(structure);
			//Actions
			var actionCol={name:'', field:'none', visible:false, width:0, cellTemplate:'<div class="ui-grid-cell-contents">'};
			 $scope.rowActions={
			        add:'<a class="grid-action" ng-click="grid.appScope.gridAction(row, 1)"><i class="fa fa-plus"></i></a>',
			        edit:'<a ng-if="!row.entity.disableEdit" class="grid-action" ng-click="grid.appScope.gridAction(row, 2)"><i class="fa fa-pencil"></i></a>',
			        remove:'<a ng-if="!row.entity.disableDelete" class="grid-action" ng-click="grid.appScope.gridAction(row, 3)"><i class="fa fa-trash-o"></i></a>'
			    };
			   if($scope.customActionSettings && $scope.customActionFunction){
			   	actionCol.cellTemplate+='<a class="grid-action" ng-click="grid.appScope.gridAction(row, 0)"><i class="fa '+$scope.customActionSettings.icon+'"></i></a>';
			   	actionCol.width+=23;
			   }			
			if($scope.actions.indexOf('A')!==-1 && $scope.isTree){
				actionCol.cellTemplate+=$scope.rowActions.add;
				actionCol.width+=23;
			}
			if($scope.actions.indexOf('E')!==-1){
				actionCol.cellTemplate+=$scope.rowActions.edit;
				actionCol.width+=23;
			}
			if($scope.actions.indexOf('D')!==-1){
				actionCol.cellTemplate+=$scope.rowActions.remove;
				actionCol.width+=23;
			}
			actionCol.cellTemplate += '</div>'
			$scope.colStructure.push(actionCol);
			
			if($scope.isTree) {//Indent Tree on level 0 - e.g. return class "padding-left-10"
				$scope.colStructure[0].cellClass = function(grid, row) {				
					return 'padding-left-' + row.entity.$$treeLevel * 10;
				}				
			}			
			$scope.gridOptions.columnDefs = $scope.colStructure;			
			//Modal Headers and Footers
            var modalHeader=function(title){
            	return '<div class="modal-header"><button type="button" class="close" ng-click="close()">×</button><h3 class="modal-title">'+title+'</h3></div><div class="modal-body"><form class="form-horizontal">';
            }
            var modalFooter=function(){
            	return '</form></div><div class="modal-footer"><button class="btn btn-primary pull-left" ng-click="ok()"><i class="fa fa-check margin-right-SM"></i>Ok</button><button class="btn btn-default" ng-click="close()"><i class="fa fa-times margin-right-SM"></i>Abbrechen</button></div>';
            }
			//************* MODAL ****************
		    $scope.gridAction = function(row, action){//0=custom, 1=add, 2=edit, 3=delete	
		    	var customActionSettings=$scope.customActionSettings;
		    	var actions = $scope.actions;
		    	var fn = $scope.fn;
		    	var SubProjects={};
		    	if(row){
		    		$scope.row=row.entity;	        
		        	$scope.modalData=angular.copy(row.entity);
		        }
		        else{
		        	$scope.row=0;
		        	$scope.modalData=[];
		        }		
		        if($scope.isTree && action===3){
		        	var SubProjects = $scope.fn({action:91, param:row.entity, data:0});
		        }		        		        
		        if(action===0){	//custom modal
		        	var modalInstance = $modal.open({
		        		size:'lg',
		        		templateUrl:customActionSettings.template,
		        		controller: customActionSettings.controller,
			            resolve: {
			                data: function () {return $scope.modalData;}
			            }		        		
		        	});
		        }		       
		        else {//standard CRUD actions
			        var modalInstance = $modal.open({
			            size:'lg',
			            controller: function($scope, data){
			               	if($scope.isTree && action===3){
			               		$scope.SubProjectsObj=[];			               	
			               		SubProjects.then(function(obj) {			        				
			        				$scope.SubProjectsObj=obj;
		        				});			            	
		        			}
			                if(action==1) {
			                    $scope.data={};
			                }
			                else {
			                    $scope.data=data;
			                }
			                //New Structure Org
			                $scope.structure=angular.copy(structure);
			                $scope.structureDirective={};
			                $scope.structure.map(function(e){$scope.structureDirective[e.field]=e;});
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
			                $scope.addMultiple = function(){
			                	$scope.close();			                	
					        	var modalInstance = $modal.open({
					        		size:'lg',
					        		templateUrl:'app/time/admin/templates/multi.html',
					        		controller: 'TimeMultiCtrl',
						            resolve: {
						                data: function () {return $scope.structureDirective;}
						            }		        		
					        	});			                	
					        	modalInstance.result.then(function (data) {	
					        		fn({action:5, param:data});
					        	});
			                };
			            },
			            resolve: {
			                data: function () {return $scope.modalData;}
			            },
			            template: function(){		            	
			                var HTML='';
			                if(action==1) {
			                    HTML+=modalHeader('Neuer Eintrag');			                    
			                    HTML+='<div class="form-group" ng-repeat="item in structure">';                
			                    HTML+='<div class="col-sm-2"><label>{{item.name}}</label></div>';     
			                    HTML+='<div class="col-sm-10"><div arbalo-input data="data[item.field]" structure="structureDirective[item.field]"></div></div>';   
			                    HTML+='</div>';
           						HTML+=modalFooter();
			                }                
			                if(action==2) {
								HTML+=modalHeader('Eintrag bearbeiten');
			                    HTML+='<div class="form-group" ng-repeat="item in structure">';                
			                    HTML+='<div class="col-sm-2"><label>{{item.name}}</label></div>';     
			                    HTML+='<div class="col-sm-10"><div arbalo-input data="data[item.field]" structure="structureDirective[item.field]"></div></div>';   
			                    HTML+=modalFooter();
			                }
			                if(action==3) {
			                    HTML+=modalHeader('Eintrag löschen?');
			                    HTML+='<div class="form-group" ng-repeat="item in structure">';
			                    HTML+='<div class="col-sm-2"><label>{{item.name}}</label></div>';
			                    HTML+='<div class="col-sm-10">{{data[item.field]}}</div>';                    
			                    HTML+='</div>';
			                    HTML+='<div ng-if="SubProjectsObj.length" class="bg-danger padding-M"><i class="fa fa-exclamation-triangle"></i> {{SubProjectsObj.length}} Unter-Elemente werden auch gelöscht:<ul class="list-normal"><li ng-repeat="e in SubProjectsObj">{{e}}</li></ul></div>';
								HTML+=modalFooter();			                
							}

			                return HTML;
			            }
			        });
				}//else action <>0
		        modalInstance.result.then(function (data) {	
		        	if(action==0){
		        		console.log(data);
		        	}
		            if(action==1) {		            	
		            	var param={action:2, param:data};		            	
		            	if($scope.isTree){
		            		param.data=$scope.row; 
		            	}
           				$scope.fn(param);               			
		            }            
		            if(action==2) {	            	
		                $scope.fn({action:3, param:data, data:0});		                
		            }
		            if(action==3) {
		            	$scope.fn({action:4, param:data, data:0});		
		            }            
		        });		    	
		    }; 			
		}
	};	
})
.directive('arbaloInput', function($compile) {	
	var getTemplate=function(structure){
		var HTML='<div>';
		if(structure.inputType==='text'){
			HTML+='<input type="text" class="form-control" ng-model="data" placeholder="' + (structure.label ? structure.label : '') + '" ' + (structure.required ? 'required' : '') + '>';
		}
		if(structure.inputType==='number'){
			HTML+='<input type="text" class="form-control" ng-model="data" placeholder="' + (structure.label ? structure.label : '') + '" ' + (structure.required ? 'required' : '') + '>';
		}	
		if(structure.inputType==='mail'){
			HTML+='<form name="test_form">';
			HTML+='<input type="text" name="mail_01" class="form-control" ng-model="data" placeholder="' + (structure.label ? structure.label : '') + '" ng-pattern="/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/i" ng-model-options="{allowInvalid:true}" ' + (structure.required ? 'required' : '') + '>';
			HTML+='</form>';			
		}	
		if(structure.inputType==='url'){
			HTML+='<form name="test_form">';
			HTML+='<input type="text" name="mail_01" class="form-control" ng-model="data" placeholder="' + (structure.label ? structure.label : '') + '" ng-pattern="/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i" ng-model-options="{allowInvalid:true}" ' + (structure.required ? 'required' : '') + '>';
			HTML+='</form>';			
		}	
		if(structure.inputType==='textarea'){
			HTML+='<textarea class="form-control" ng-model="data" placeholder="' + (structure.label ? structure.label : '') + '"></textarea>';
		}
		if(structure.inputType==='select'){
			HTML+='<select class="form-control" ng-options="item for item in structure.dataSource" ng-model="data">';
		}	
		if(structure.inputType==='country-list'){
			HTML+='<div get-country-list model="data"></div>';
		}				
		if(structure.inputType==='custom-dropdown'){	
			//Single Type	
			HTML+='<div ng-if="dropOPT.structure.length === 1" class="clearfix">';	
			HTML+='	<div ng-repeat="item in data track by $index" ng-init="i=$index" ng-if="!item.deleted" class="input-group margin-bottom-S">';
		    HTML+='  <div class="input-group-btn" dropdown>';
		    HTML+='    <button type="button" class="btn btn-default" ng-if="dropOPT.customInput !== i" dropdown-toggle>{{item.attributeType}} <span class="caret"></span></button>';
			HTML+='		<div ng-if="dropOPT.customInput === i" class="input-group">';
			HTML+='			<input class="form-control width100" ng-model="item.attributeType">';
            HTML+='			<span class="input-group-btn">';
            HTML+='				<button class="btn btn-default" ng-disabled="item.attributeType===\'\'" ng-click="dropOPT.customInput=-1"><span class="fa fa-check"></span></button>';
            HTML+='			</span>';
            HTML+='		</div>';		    
		    HTML+='    <ul class="dropdown-menu">';
		    HTML+='      <li ng-repeat="type in dropOPT.dropItems"><a ng-click="dropSelectItem(item, type)">{{type}}</a></li>';
		    HTML+='      <li role="separator" class="divider"></li>';
		    HTML+='      <li><a ng-click="setCustomDropdown(i)">Benutzerdefiniert</a></li>';
		    HTML+='    </ul>';
		    HTML+='  </div>';
		    HTML+='  <div arbalo-input data="item[dropOPT.structure[0].model]" structure="dropOPT.structure[0]"></div>';
		    HTML+=' <span class="input-group-btn">';
		    HTML+='    <button class="btn btn-default" type="button" ng-click="removeElement(item, i)"><i class="fa fa-trash-o"></i></button>';
		    if(structure.dropdownMulti===1){
		    	HTML+='    <button class="btn btn-default" type="button" ng-click="newDropMenu()"><i class="fa fa-plus"></i></button>';
		    }
		    HTML+='  </span>';
		    HTML+='	</div>';
		    HTML+='</div>';

		    //Multiple Fields
			HTML+='<div ng-if="dropOPT.structure.length > 1"  class="clearfix">';
			HTML+='	<div ng-repeat="item in data track by $index" ng-init="i=$index" ng-if="!item.deleted" class="margin-bottom-S">';
		    HTML+='  <div class="input-group-btn padding-bottom-S" dropdown>';
		    HTML+='    <button type="button" class="btn btn-default" ng-if="dropOPT.customInput !== i" dropdown-toggle>{{item.attributeType}} <span class="caret"></span></button>';
			HTML+='		<div ng-if="dropOPT.customInput === i" class="input-group">';
			HTML+='			<input class="form-control width100" ng-model="item.attributeType">';
            HTML+='			<span class="input-group-btn">';
            HTML+='				<button class="btn btn-default" ng-disabled="item.attributeType===\'\'" ng-click="dropOPT.customInput=-1"><span class="fa fa-check"></span></button>';
            HTML+='			</span>';
            HTML+='		</div>';		    
		    HTML+='    <ul class="dropdown-menu">';
		    HTML+='      <li ng-repeat="type in dropOPT.dropItems"><a ng-click="dropSelectItem(item, type)">{{type}}</a></li>';
		    HTML+='      <li role="separator" class="divider"></li>';
		    HTML+='      <li><a ng-click="setCustomDropdown(i)">Benutzerdefiniert</a></li>';
		    HTML+='    </ul>';
			HTML+='		<button ng-if="dropOPT.customInput !== i" class="btn btn-default" ng-click="removeElement(item, i)"><i class="fa fa-trash-o"></i></button>';
			if(structure.dropdownMulti===1){
		    	HTML+='    	<button ng-if="dropOPT.customInput !== i" class="btn btn-default" type="button" ng-click="newDropMenu()"><i class="fa fa-plus"></i></button>';
		    }		    		   
		    HTML+='  </div>';			
			HTML+='		<div ng-repeat="e in dropOPT.structure" class="row">';			
            HTML+='			<div class="col-sm-3"><label>{{e.label}}</label></div>';
            HTML+='			<div class="col-sm-9"><div arbalo-input data="item[e.model]" structure="e"></div></div>';
			HTML+='		</div>';
			HTML+='	</div>';
			HTML+='</div>';
        }		
		HTML+='</div>';
		return HTML;
	}
	return {
		restrict: "A",		
		scope: {
			data:'=',
			structure:'='
		},
		controller:function($scope){	
			var emptyOBJ;
			if($scope.structure.inputType==='custom-dropdown'){				
				emptyOBJ={addressType:$scope.structure.dropdownObj, attributeType:$scope.structure.dropdownItems[0], value:''}; 
				$scope.dropOPT={dropItems:$scope.structure.dropdownItems, customInput:-1, structure:$scope.structure.fields};				
				if(!$scope.data){
					$scope.data=[angular.copy(emptyOBJ)];
				}				
			}
			else{
				if(!$scope.data){
					$scope.data='';
				}				
			}
			$scope.setCustomDropdown=function(i){
				$scope.dropOPT.customInput=i;
			};
			$scope.dropSelectItem=function(e, item){
				e.attributeType=item;
			};
			$scope.newDropMenu=function(){
				$scope.data.push(angular.copy(emptyOBJ));
			};
			$scope.removeElement=function(obj, i){
				console.log(obj, i)
				if(obj.id){
					obj.deleted=1;
				}
				else {
					$scope.data.splice(i, 1);
				}
			};
		},
		link: function(scope,el, attrs) {
        	var HTML = getTemplate(scope.structure);
			var template = angular.element($compile(HTML)(scope));
			el.replaceWith(template);  
		}
	}
})
.directive('arbaloDisplay', function($compile) {	
	var getTemplate=function(structure, data){
		var HTML='<div>';
		if(structure.inputType==='text'){
			HTML+=data;
		}
		if(structure.inputType==='number'){
			HTML+=data;
		}		
		if(structure.inputType==='textarea'){
			HTML+=data;
		}
		if(structure.inputType==='select'){
			HTML+=data;
		}	
		if(structure.inputType==='custom-dropdown'){			
			for(var i=0;i<data.length;i++){
				if(data[i].addressType===structure.dropdownObj){
					HTML+='<div class="pull-left margin-right-L">'
					HTML+='<div class="atr-type">'+data[i].attributeType+'</div>';
					HTML+=(data[i].msgType ? data[i].msgType : '');					
					if(data[i].value){
						if(structure.fields.map(function(e){return e.inputType;}).indexOf('mail')!==-1){
							HTML+='<a href="mailto:'+data[i].value+'">'+data[i].value+'</a>';
						}
						else if(structure.fields.map(function(e){return e.inputType;}).indexOf('url')!==-1){
							var dataTMP=data[i].value;
							if (!dataTMP.match(/^[a-zA-Z]+:\/\//)) {
							    dataTMP = 'http://' + dataTMP;
							}
							HTML+='<a href="'+dataTMP+'" target="_blank">'+data[i].value+'</a>';
						}						
						else{
							HTML+=data[i].value;
						}
					}
					HTML+=(data[i].street ? '<span class="padding-right-M">'+data[i].street+'</span>' : '');
					HTML+=(data[i].postalCode ? '<span class="padding-right-M">'+data[i].postalCode+'</span>' : '');
					HTML+=(data[i].city ? '<span class="padding-right-M">'+data[i].city+'</span>' : '');
					HTML+=(data[i].country ? '<span class="padding-right-M">'+data[i].country+'</span>' : '');
					HTML+='</div>';
				}
			}
		}
		HTML+='</div>';
		return HTML;
	}
	return {
		restrict: "A",		
		scope: {
			data:'=',
			structure:'='
		},
		link: function(scope,el, attrs) {
        	var HTML = getTemplate(scope.structure, scope.data);
			var template = angular.element($compile(HTML)(scope));
			el.replaceWith(template);  
		}
	}
});