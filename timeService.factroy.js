'use strict';

/* 
 * a factory providing access to the rates REST service (RatesRS)
 */
angular.module('time')
.factory('TimeService', function() {
	var mod = {};
	mod.formatAddLeadingZero = function(input){
		return (input<10?'0':'')+input;
		};	
	mod.calculateTime = function(from, to, hrs){
		var output={from:0, to:0, duration:0, durationhours:0, durationminutes:0, hours:0, minutes:0}; //12.00-1330 => duration:1.5 dhours:1 dminutes:30 hours:12 minutes:00
		if(!hrs){
			if(from.length===2){from+='00'};
			if(to.length===2){to+='00'};
			output.from=from;
			output.to=to;
			output.durationhours=to.substr(0,2) - from.substr(0,2);
			output.durationminutes=to.substr(2,2) - from.substr(2,2);
			output.duration=output.durationhours + (Math.round( (output.durationminutes / 60) * 10 ) / 10);
			if(output.durationminutes<0){
				output.durationhours-=1;
				output.durationminutes+=60;
			}
		}
		else{
			if(from.length===2){from+='00';}
			output.from=from;
			output.durationhours=Math.floor(hrs);
			output.durationminutes=Math.round((hrs-output.durationhours) * 60);
			output.duration=Math.round(hrs * 10) / 10;
			var d1=parseInt(output.from.substr(0,2)) + output.durationhours;
			var d2=parseInt(output.from.substr(2,2)) + output.durationminutes;
			if(d2>=60){
				d1++;
				d2=d2-60;
			}
			output.to = (d1 < 10 ? '0'+d1 : d1) + '' + (d2 < 10 ? '0'+d2 : d2);
		}
		output.hours=output.from.substr(0,2);
		output.minutes=output.from.substr(2,2);
		if(output.duration<=0){
			return false;
			}			
		return output;
	};
	mod.validateTime = function(t){
		var result=false;
		var partsM=t.split("-");
		var partsS=t.split(" ");			
		if(partsM[1]){
			if(partsM[0].length===2 && partsM[1].length===2){//10-12
				if(!(isNaN(partsM[0]) && isNaN(partsM[1])) && partsM[1]>partsM[0] && partsM[1]<=24){
					result=mod.calculateTime(partsM[0], partsM[1]);
				}
			}
			else if(partsM[0].length===4 && partsM[1].length===4){//1000-1200
				if(partsM[1].substr(0,2) <=24 && !(isNaN(partsM[0]) && isNaN(partsM[1])) && (partsM[1].substr(0,2) > partsM[0].substr(0,2) || (partsM[1].substr(0,2) === partsM[0].substr(0,2) && partsM[1].substr(2,4) > partsM[0].substr(2,4)))) {
					result=mod.calculateTime(partsM[0], partsM[1]);
				}
			}					
		}									
		else if(partsS[1]){
			if((partsS[0].length===2 || partsS[0].length===4)  && !(isNaN(partsS[1]) && isNaN(partsS[1]))) {//10 1.5 1000 1.5
				result=mod.calculateTime(partsS[0], 0, partsS[1]); 
			}
		}			
		return result;
	};
	mod.addTimetoDate = function(datum, h, m){
		var d = new Date(datum);
		d.setHours(d.getHours() + h, d.getMinutes() + m);
		return d;
	};
	mod.getFromToStartDuration = function(datum, h, m){
		var d=new Date(datum);
		var from=mod.formatAddLeadingZero(d.getHours()) + '' + mod.formatAddLeadingZero(d.getMinutes());			
		var to1=parseInt(from.substr(0,2)) + h;
		var to2=parseInt(from.substr(2,2)) + m;
		if(to2>=60){
			to1=to1+1;
			to2=to2-60;
		}
		var to=mod.formatAddLeadingZero(to1)+''+mod.formatAddLeadingZero(to2);
		return {from:from, to:to};
	};
	mod.getDurationHMStartEnd = function(start, end){
		var diff=end-start;
		var hours = Math.floor((diff % 86400000) / 3600000);
		var minutes = Math.round(diff / (1000 * 60)) - (hours*60);	
		if(minutes>=60) {
			hours++;
			minutes=minutes-60;
		}
		return {hours:hours, minutes:minutes};
	};
	mod.calculateFromTo = function(from, to){
		var d1=new Date(from);
		var timeFrom=mod.formatAddLeadingZero(d1.getHours()) + '' + mod.formatAddLeadingZero(d1.getMinutes());			
		var d2=new Date(to);
		var diff = d2 - d1;
		var hours = Math.floor((diff % 86400000) / 3600000);
		var minutes = Math.round(diff / (1000 * 60)) - (hours*60);	
		if(minutes>=60) {
			hours++;
			minutes=minutes-60;
		}			
		var dtimeTo = mod.addTimetoDate(from, hours, minutes);
		var timeTo=mod.formatAddLeadingZero(dtimeTo.getHours()) + '' + mod.formatAddLeadingZero(dtimeTo.getMinutes());
		return {from:timeFrom, to:timeTo};			
	}
	return mod;
});