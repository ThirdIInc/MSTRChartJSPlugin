/*
 * Date : 02/16/2018 
 * This plugin reads data from the MSTR grid and exhibits a DoughnutChart. 
 * Created by Rashmit Chudasama (Third I Technologies).
 */
(function () {
    if (!mstrmojo.plugins.ChartJSDoughnutChart) {
        mstrmojo.plugins.ChartJSDoughnutChart = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.CustomVisBase",
        "mstrmojo.models.template.DataInterface"
    );

    mstrmojo.plugins.ChartJSDoughnutChart.ChartJSDoughnutChart = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.ChartJSDoughnutChart.ChartJSDoughnutChart",
            cssClass: "ChartJSDoughnutChart",
            errorMessage: "Either there is not enough data to display the visualization or the visualization configuration is incomplete.",
            errorDetails: "This visualization requires one or more attributes and one metric.",
            externalLibraries: [{
				url : "../plugins/ChartJSDoughnutChart/javascript/jquery.min.js"
			},
			{
				url : "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js"
			}],
            useRichTooltip: false,
            reuseDOMNode: false,
            supportNEE: true, // indicate the widget supports PDF exporting by New Export Engine
            setScaleValue: function setScaleValue(isScale) {
                var value = +this.getProperty("value");
                value = isScale ? ++value : --value;
                var properties = this.getProperties();
                properties["value"] = value;
                properties["scales"] = {inc: 'false', dec: 'false'};
            },
            plot: function () {
            	debugger;
            	var html = '<div id="presentationDiv"> <canvas id="myChart"></canvas></div>';
				var errorDiv = '<div id="doughnutChartError" style="color:red;font-size: 10pt;"></div>';
				
				var gridID = this.domNode.id;
				gridID = gridID.replace(/\*/g, '\\*');
				var height = this.height, width = this.width, top = this.top, left = this.left;
				$('#myChart').css({
					"width" : width + "px",
					"height" : height + "px",
				});
				$('#doughnutChartError').css({
					"width" : width + "px",
					"height" : height + "px",
				});
				$('#' + gridID).css({"top":top,"left":left});
				$('#' + gridID).append(html);
				$('#' + gridID).append(errorDiv);
				try{
					// Check number of metrics arrived in grid
					var totalCols = this.model.data.data.totalCols;
					// Check number of rows arrived in metrics
					var totalRows = this.model.data.data.totalRows;
					
					var jsonData = this.model.data.data.rows[0].row;
					if(totalCols == 1 && totalRows == 0){	 
						
						// get formatted value e.g. 76%
	    				var formattedValue = this.model.data.data.rows[0].row[Object.keys(jsonData)[0]];
	    				
			            // Get unformatted value e.g. 0.76
						var percentage = this.model.data.data.rows[0].row[Object.keys(jsonData)[1]];
						
						if((percentage <= 1)&&(percentage !== undefined)){
							percentage = percentage * 100;
			    			if(percentage % 1 != 0)
			    			{
			    				percentage = percentage.toFixed(2);
			    			}
			    			
			    			// set default values if not defined
			    			var circleFillColor="#58cb83";
			    			var circleUnFilledColor="#f1f1f1";
			    			var valueFillColor="#f90";
			    			var valueFontFamily="Tahoma";
			    			
			    			// Set grid values to variables
			    			if(this.model.data.vp.filledColor !== undefined)		    			
			    				circleFillColor = this.model.data.vp.filledColor;
			    			if(this.model.data.vp.unFilledColor !== undefined)
			    				circleUnFilledColor = this.model.data.vp.unFilledColor;
			    			if(this.model.data.vp.valueColor !== undefined)
			    				valueFillColor = this.model.data.vp.valueColor;
			    			if(this.model.data.vp.fontFamily !== undefined)
			    				valueFontFamily = this.model.data.vp.fontFamily;
							
			    			// Get Grid Header value
							var labelValue = Object.keys(jsonData)[0];
							var dataList = getDataList(percentage);
							renderHTML(labelValue, dataList);
						 }else{
							 $("#doughnutChartError").append("Value must be less than or equal to 100(%) in Doughnut Chart"); 	
						 }
					}else{
						$("#doughnutChartError").append("Grid structure is not appropriate.");
					}		
				}catch(err){
					console.log("Error : plot function");
					$("#doughnutChartError").append("Something went wrong.");
				}
				
				function renderHTML(labelValue, dataList) {
							debugger;
							var fillColorArray = getColorArrayForGraph(circleFillColor,circleUnFilledColor);
							var tooltipLabelList = getTooltipLabelList();
							var ctx = document.getElementById("myChart");
							var myChart = new Chart(ctx, 
									{
										type : 'doughnut',
										data : {
											   labels : [],
											   datasets : [{
													label : '',
													data : dataList,
													backgroundColor : fillColorArray,
													borderColor : fillColorArray,
													borderWidth : 1
											   }]
										},
										options : {
											maintainAspectRatio: false,
											cutoutPercentage : 80,
											tooltips : {
												mode : 'index',
												callbacks : {
													label : function(t,json) {
														var tipLabel = tooltipLabelList[t.index];
														return tipLabel;
													}
												}
											},
											title : {
												display : true,
												position : 'bottom',
												text : labelValue
											},
											legend : {
												labels : {
													boxWidth : 0,
												}
											},
											animation: {
								                animateScale: true,
								                animateRotate: true
								            },
								            elements: {
												center: {
													text: dataList[0] + '%',
													color: circleFillColor, // Default 
													fontStyle: 'Arial', // Default 
													sidePadding: 20  // Default(%)
											    }
										    }
									   }
						       });
				         }
				
				         function getDataList(filledPercent){
				        	  var dataList = [];
				        	  if(filledPercent != undefined && filledPercent != null && filledPercent != ""){
				        		   var unfilledPercent = 100 - filledPercent;
				        		   dataList.push(filledPercent);
				        		   dataList.push(unfilledPercent);
				        	  }
				        	  return dataList;
				         }
				         
				         function getColorArrayForGraph(circleFillColor,circleUnFilledColor){
				        	 var colorArray = [];
				        	 colorArray.push(circleFillColor);
				        	 colorArray.push(circleUnFilledColor);
				        	 return colorArray;
				         }
				         
				         // Draw and customize text and fonts in the middle of dooughnut chart
				         Chart.pluginService.register({
				        	  beforeDraw: function (chart) {
				        	    if (chart.config.options.elements.center) {
				        	      //Get ctx from string
				        	      var ctx = chart.chart.ctx;

				        	      //Get options from the center object in options
				        	      var centerConfig = chart.config.options.elements.center;
				        	      var fontStyle = centerConfig.fontStyle || 'Arial';
				        	      var txt = centerConfig.text;
				        	      var color = centerConfig.color || '#000';
				        	      var sidePadding = centerConfig.sidePadding || 20;
				        	      var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
				        	      //Start with a base font of 30px
				        	      ctx.font = "30px " + fontStyle;

				        	      //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
				        	      var stringWidth = ctx.measureText(txt).width;
				        	      var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

				        	      // Find out how much the font can grow in width.
				        	      var widthRatio = elementWidth / stringWidth;
				        	      var newFontSize = Math.floor(30 * widthRatio);
				        	      var elementHeight = (chart.innerRadius * 2);

				        	      // Pick a new font size so it will not be larger than the height of label.
				        	      var fontSizeToUse = Math.min(newFontSize, elementHeight);

				        	      //Set font settings to draw it correctly.
				        	      ctx.textAlign = 'center';
				        	      ctx.textBaseline = 'middle';
				        	      var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
				        	      var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
				        	      ctx.font = fontSizeToUse+"px " + fontStyle;
				        	      ctx.fillStyle = color;

				        	      //Draw text in center
				        	      ctx.fillText(txt, centerX, centerY);
				        	    }
				        	  }
				        	});
				         
				         function getTooltipLabelList(){
				        	 var labelList = [];
				        	 labelList.push("Contributed(%)");
				        	 labelList.push("OnHold(%)");
				        	 return labelList;
				         } 
                            	
            }//end of plot function
        
        })
}());
//@ sourceURL=ChartJSDoughnutChart.js