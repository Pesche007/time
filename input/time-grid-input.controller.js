'use strict';

angular.module('time')
  .controller('TimeGridinputCtrl', function ($scope, $filter, cfg, WorkrecordService, TimeService, sharedProperties, alertsManager) {

  	$scope.gridOPT={projectInput:[], template:[], sumtime:[0, 0, 0, 0, 0, 0, 0], showDays:5};

	//Prepare Grid Object
	$scope.newGrid = function(){	
		//Create new empty Object
		$scope.gridOPT.projectInput=[];
		var curr=angular.copy($scope.dt);
		var inputOBJ={company:'', project:'', inputs:[], sumtime:0};
  		var d = new Date(curr);
  		var day = curr.getDay();
      	var diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  		var first = new Date(d.setDate(diff));
		for(var i=0;i<7;i++){
			var currentdate = new Date(first);
			var weekDay = new Date(currentdate.setDate(currentdate.getDate() + i));
			inputOBJ.inputs.push([{date:weekDay, time:'', comment:'', startAt:'', duration:0}]);			
		}
		$scope.gridOPT.template=angular.copy(inputOBJ);
	};
	//save grid
	$scope.saveGrid = function(newGrid){
		var i, j, k, obj, loopIndex, loopOBJ={save:[], projecterr:0, timeerr:0, alert:0};
		for(i=0;i<$scope.gridOPT.projectInput.length;i++){//row			
			if($scope.gridOPT.projectInput[i].company ==='' || $scope.gridOPT.projectInput[i].project ===''){
				loopOBJ.projecterr=1;
			}
			for(j=0;j<$scope.gridOPT.projectInput[i].inputs.length;j++){//col
				for(k=0;k<$scope.gridOPT.projectInput[i].inputs[j].length;k++){//entries within col
					obj=$scope.gridOPT.projectInput[i].inputs[j][k];				
					if(obj.time !=='' && (obj.$$changed || obj.$$deleted)){//Are entries changed or deleted
						if(TimeService.validateTime(obj.time)){
							if(loopOBJ.projecterr){
								loopOBJ.alert=1;
								break;
							}
							else{//entry ok, prepare for saving
								obj.companyId=$scope.gridOPT.projectInput[i].company.id;
								obj.companyTitle=$scope.gridOPT.projectInput[i].company.title;
								obj.projectId=$scope.gridOPT.projectInput[i].project.id;
								obj.projectTitle=$scope.gridOPT.projectInput[i].project.title;
								obj.resourceId='RESOURCE';
								loopOBJ.save.push(obj);
							}
						}
						else{
							loopOBJ.timeerr=1;
							loopOBJ.alert=1;
							break;
						}
					}
				}//k
			}//j
			if(loopOBJ.alert)	{				
				var errtxt='';
				if(loopOBJ.projecterr){
					errtxt+='Firma und Projekt auswählen. '
				}
				if(loopOBJ.timeerr){
					errtxt+='Zeitformate überprüfen.'
				}				
				alertsManager.addAlert(errtxt, 'danger', 'fa-times', 1);
				return;
			}
		}//row	
		if(loopOBJ.save.length){
			WorkrecordService.savemulti(loopOBJ.save).then(function(result) {
				alertsManager.addAlert('Einträge gespeichert.', 'success', 'fa-check', 1);
		   	}, function(reason) {//error
			    alertsManager.addAlert('Fehler beim Speichern.', 'error', 'fa-times', 1);
		  	});	
		}	
		else{
			alertsManager.addAlert('Keine geänderten Einträge.', 'success', 'fa-check', 1);
		}					
		if(newGrid){
			$scope.newGrid();
		}		
	};

	//new row
	$scope.projectsAddRow = function(){
		$scope.gridOPT.projectInput.push(angular.copy($scope.gridOPT.template));
	};
	//New Time Slot
	$scope.addTimeSlot = function(item){
		var newDate=angular.copy(item[0].date);
		item.push({date:newDate, time:'', comment:'', startAt:'', duration:0})
	};
	//sum time
	$scope.sumTime = function(obj, parent){
		if(obj.time){
			var timeOBJ=TimeService.validateTime(obj.time);
			if(timeOBJ){				
				var index = obj.date.getDay() - 1;
				if(index===-1){
					index=6;
				}
				//Update object & row
				obj.startAt=angular.copy(obj.date);
				obj.startAt.setHours(timeOBJ.hours, timeOBJ.minutes, 0);
				obj.duration=parseFloat(timeOBJ.duration); 
				obj.durationHours=timeOBJ.durationhours;
				obj.durationMinutes=timeOBJ.durationminutes;
				var merged = [];
				merged = merged.concat.apply(merged, parent.inputs);	
				var rowTimes=merged.map(function(e){
					return (e.$$deleted ? 0 : e.duration);
				});
				parent.sumtime=parseFloat(rowTimes.reduce(function(a,b){return a+b;})); //Update Row
				//Update Column
				var sum=0;
				for(var i=0;i<$scope.gridOPT.projectInput.length;i++){
					merged = [];
					merged = merged.concat.apply(merged, $scope.gridOPT.projectInput[i].inputs[index]);							
					rowTimes=merged.map(function(e){
						return (e.$$deleted ? 0 : e.duration);
					});
					sum+=parseFloat(rowTimes.reduce(function(a,b){return a+b;})); 
				}	
				$scope.gridOPT.sumtime[index]=sum;			
			}
		}
	};

	//******************** DATE **************************************/
	//Datepicker
	$scope.dt = new Date();//$filter('date')(new Date(), 'yyyy-MM-dd');
	$scope.dt.setHours(0,0,0,0);
	$scope.dateOptions = {
	    startingDay: 1
	  };	
	$scope.loadDate = function(dir){
		var currentdate = new Date($scope.dt);
		var currentday=currentdate.getDay();
		var weekSwitch=false;		
		if(dir===7 || dir===-7){
			weekSwitch=true;
		}
		if($scope.gridOPT.showDays===5){			
			if(dir === 1){
				if(currentday === 5){dir=3;weekSwitch=true;}
				if(currentday === 6){dir=2;weekSwitch=true;}
			}
			if(dir === -1){
				if(currentday === 1){dir=-3;weekSwitch=true;}
				if(currentday === 0){dir=-2;weekSwitch=true;}
			}
			
		}
		if($scope.gridOPT.showDays===7){
			if(dir === 1){				
				if(currentday === 0){weekSwitch=true;}
			}
			if(dir === -1){
				if(currentday === 1){weekSwitch=true;}				
			}
		}
		$scope.dt=new Date(currentdate.setDate(currentdate.getDate() + dir));			
		if(weekSwitch){
			$scope.saveGrid(1);		
		}
	};	
	$scope.opened=[];
	$scope.open = function($event, openid) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened[openid] = !$scope.opened[openid]
	};	
	$scope.formatedate = function (obj){ 
		obj.date = $filter('date')(obj.date, 'dd.MM.yyyy');
	};
	/************* GRID INIT ********************/
	//INIT and load data
	$scope.newGrid(); //new empty grid	
	WorkrecordService.list().then(function(result) {
		var index, current, currentdate, currentday, currentInput, currentIndex, timeOBJ, merged, data = result.data.workRecordModel;
		if(!data.length){
			$scope.projectsAddRow();
		}
		for(var i=0;i<data.length;i++){
			index=$scope.gridOPT.projectInput.map(function(e){return e.project.id}).indexOf(data[i].projectId); //Check if project already in list
			if(index===-1){//push new line
				$scope.projectsAddRow();
				index=$scope.gridOPT.projectInput.length - 1;
			}
			//Add data properties
			timeOBJ=TimeService.getFromToStartDuration(data[i].startAt, data[i].durationHours, data[i].durationMinutes);
			data[i].time=timeOBJ.from+'-'+timeOBJ.to;
			data[i].date=new Date(angular.copy(data[i].startAt));
			data[i].date.setHours(0,0,0,0);
			data[i].duration=Math.round((data[i].durationHours + data[i].durationMinutes / 60) * 10) / 10;
			//Input in grid			
			current=$scope.gridOPT.projectInput[index];
			current.project={id:data[i].projectId, title:data[i].projectTitle};
			current.company={id:data[i].companyId, title:data[i].companyTitle};	
			if(!current.sumtime){current.sumtime=0};//Update row time
			current.sumtime += data[i].duration; 
			currentdate = new Date(data[i].startAt);
			currentday=currentdate.getDay() - 1;				
			if(currentday===-1){
				currentday=6;
			}			
			currentInput=current.inputs[currentday];
			currentIndex=0;					
			currentInput.map(function(e, pos){
				if(new Date(e.startAt) < new Date(data[i].startAt)){
					currentIndex=pos+1;
				};
			});		
			if(currentInput[0] && currentInput[0].time===''){
				currentInput[0]=data[i];
			}
			else {
				currentInput.splice(currentIndex, 0, data[i]);
			}
			$scope.gridOPT.sumtime[currentday]+=data[i].duration;		
		}//end for		
	}, function(reason) {//error
		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	});	
	/** DEBUG **/
	$scope.sharedProperties = sharedProperties.getProperties();
  });