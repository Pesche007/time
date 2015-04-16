'use strict';

/* 
 * a factory providing access to the rates REST service (RatesRS)
 */
angular.module('time')
.factory('TimeService', function() {
	return {
		timeToHoursMinutes: function(input){
			if(input.length===9){
				var parts=input.split('-');
				if(parts[0] && parts[1] && (parts[1]-parts[0]>0)){
					var diff=parts[1]-parts[0];
					var hour=Math.floor(diff/100);
					var minutes = diff-hour*100;							
					return {'h':hour, 'm':minutes};
				}
			}
			if(!isNaN(input)){
				var minutes=(input % 1).toFixed(2);
				var hour = Math.floor(input - parseInt(minutes));	
				minutes=Math.round(minutes*60);		
				return {'h':hour, 'm':minutes};
			}
		},
		msToHoursMinutes: function(ms){
			var d, h, m, s;
			s = Math.floor(ms / 1000);
			m = Math.floor(s / 60);
			s = s % 60;
			h = Math.floor(m / 60);
			m = m % 60;
			d = Math.floor(h / 24);
			h = h % 24;
			return { d: d, h: h, m: m, s: s };
		},	
		displaySum: function(tree){
			var times = tree.map(function(e){return e.time});
			var sum=0;
			for(var i=0;i<times.length;i++){
				if(times[i]){
					if(times[i].length===9){
						var parts=times[i].split('-');
						if(parts[0] && parts[1] && (parts[1]-parts[0]>0)){
							var diff=parts[1]-parts[0];
							var hour=Math.floor(diff/100);			
							var res = hour+(diff-hour*100)/60;
							sum+=parseFloat(res);
						}
					}	
					else{
						sum+=parseFloat(times[i]);
					}		
				}
			}
			return Math.round(sum*100)/100;;
		}		
	}
});