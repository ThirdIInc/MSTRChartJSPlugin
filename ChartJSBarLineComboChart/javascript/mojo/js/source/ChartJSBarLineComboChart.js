/*
 * Date : 02/16/2018 
 * This plugin reads data from the MSTR grid and exhibits a AreaChart. 
 * Created by Rashmit Chudasama (Third I Technologies).
 */
(function () {
    if (!mstrmojo.plugins.ChartJSBarLineComboChart) {
        mstrmojo.plugins.ChartJSBarLineComboChart = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.CustomVisBase",
        "mstrmojo.models.template.DataInterface"
    );

    mstrmojo.plugins.ChartJSBarLineComboChart.ChartJSBarLineComboChart = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.ChartJSBarLineComboChart.ChartJSBarLineComboChart",
            cssClass: "ChartJSBarLineComboChart",
            errorMessage: "Either there is not enough data to display the visualization or the visualization configuration is incomplete.",
            errorDetails: "This visualization requires one or more attributes and one metric.",
            externalLibraries: [{
				url : "../plugins/ChartJSBarLineComboChart/javascript/jquery.min.js"
			},
			{
				url : "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js"
			}],
            useRichTooltip: false,
            reuseDOMNode: false,
            supportNEE: true, // indicate the widget supports PDF exporting by
								// New Export Engine
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
				var errorDiv = '<div id="comboChartError" style="color:red;font-size: 10pt;"></div>';
				
				var gridID = this.domNode.id;
				gridID = gridID.replace(/\*/g, '\\*');
				var height = this.height, width = this.width, top = this.top, left = this.left;
				$('#myChart').css({
					"width" : width + "px",
					"height" : height + "px",
				});
				$('#comboChartError').css({
					"width" : width + "px",
					"height" : height + "px",
				});
				$('#' + gridID).css({"top":top,"left":left});
				$('#' + gridID).append(html);
				$('#' + gridID).append(errorDiv);
		
				try{
					
					var gridData = this.model.data.data.rows;
					// total number of column headers
					var totalCols = this.model.data.data.totalCols;
					// total number of row headers
					var totalRows = this.model.data.data.totalRows;
					var validationFlag = isValidate(totalRows,totalCols);
					var dataJson = [];
					if(validationFlag){
						for(var i=0; i < gridData.length; i++){
							var jsonData = this.model.data.data.rows[i].row;
							dataJson.push({
								xData : this.model.data.data.rows[i].row[Object.keys(jsonData)[0]],
								yData : this.model.data.data.rows[i].row[Object.keys(jsonData)[2]],
								yData1 : this.model.data.data.rows[i].row[Object.keys(jsonData)[4]],
								formattedData : this.model.data.data.rows[i].row[Object.keys(jsonData)[1]],
								formattedData1 : this.model.data.data.rows[i].row[Object.keys(jsonData)[3]]
							});	
						}
						var xDataList = getXDataListFromJson(dataJson);
						var yDataList = getYDataListFromJson(dataJson,null);
						var y1DataList = getYDataListFromJson(dataJson,1);
						var formattedValueList = getFormattedDataListFromJson(dataJson,null); 
						var formattedValueList1 = getFormattedDataListFromJson(dataJson,1);
						var firstRow = this.model.data.data.rows[0].row;
						var graphTitle = Object.keys(firstRow)[1] + " & " +Object.keys(firstRow)[3];
						var xAxisLabel = Object.keys(firstRow)[0];
						var element = this.dataInterface;
						var barColor = "#9999ff";
						if(element.data.vp.barColor != ""){
							barColor = element.data.vp.barColor;
						}
						var lineColor = "#0000ff";
						if(element.data.vp.lineColor != ""){
							lineColor = element.data.vp.lineColor;
						}
						if(xDataList != undefined && !jQuery.isEmptyObject(xDataList) && yDataList != undefined && !jQuery.isEmptyObject(yDataList)){
							renderHtml(xDataList, yDataList, y1DataList, xAxisLabel, 
									graphTitle, formattedValueList, formattedValueList1, dataJson.length,barColor,lineColor); 	
						}else{
							$("#comboChartError").append("Insuffiecient data.");	 
						}
					}else{
						$("#comboChartError").append("Grid structure is not appropriate. Please refer README file.");
					}		
				}catch(err){
					console.log(err);
					$("#comboChartError").append("Something went wrong. Open console to identify an error.");
				}
				
				var chartData = {
						labels: xDataList,
						datasets: [{
							type: 'line',
							label: '',
							borderColor: fillColorArray[0],
							borderWidth: 2,
							fill: false,
							tension : 0,
							data: y1DataList
						}, {
							type: 'bar',
							label: '',
							backgroundColor: fillColor,
							data: yDataList,
							borderColor: fillColorArray,
							borderWidth: 2
						}]

            	};

				function renderHtml(xDataList, yDataList, y1DataList, xAxisLabel, graphTitle, formattedValueList, formattedValueList1, sizeOfData,barColor,lineColors) {
							debugger;
							var fillColorArray = getColorArrayForGraph(dataJson.length);
							var ctx = document.getElementById("myChart");
							var myChart = new Chart(ctx,
									{
								       type : 'bar',
								       data : {
								    	      datasets: [{
									    	            label: '',
									    	            backgroundColor: barColor,
														data: yDataList,
														borderColor: barColor,
														borderWidth: 2,
														opacity : 0.4
								    	          }, {
								    	        	    type: 'line',
								    	        	    label: '',
														borderColor: lineColors,
														borderWidth: 2,
														data: y1DataList,
														fill : false,
														lineTension : 0
								    	        }],
								    	        labels: xDataList  
								       },
									   options : {
											scales : {
												yAxes : [ {
													ticks : {
														beginAtZero : true,
													},
													gridLines : {
														drawOnChartArea : true,
														color : getGridColorArrayForY(sizeOfData),
														zeroLineColor : 'rgba(0, 0, 0, 0.3)'
													},
													scaleLabel : {}
												} ],
												xAxes : [ {
													ticks : {
														display : true,
														beginAtZero : true,
														autoSkip: false
													},
													gridLines : {
														drawOnChartArea : true,
														color : getGridColorArrayForX(sizeOfData),
														zeroLineColor : 'rgba(0, 0, 0, 0.6)'
													},
													scaleLabel : {
														display : true,
														labelString : xAxisLabel
													}
												} ]
											},
											tooltips : {
												mode : 'index',
												callbacks : {
													label : function(t,json) {
														if (t.datasetIndex === 0) {
												            return formattedValueList[t.index];
												        } else if (t.datasetIndex === 1) {
												            return formattedValueList1[t.index];
												        }
													}
												}
											},
											title : {
												display : true,
												text : graphTitle
											},
											legend : {
												labels : {
													boxWidth : 0
												}
											}
										}
									});
				         }
				
				function pickColorForBar(element){
					var barColor1234 = "#0000ff";
					if(element.data.vp.barColor != ""){
						barColor1234 = element.data.vp.barColor;
					}
					return barColor1234;
				}
							
				/*
				 * following function returns a list of data which will plot on
				 * x axis.
				 */
				function getXDataListFromJson(json) {
					var xDataList = [];
					for (var i = 0; i < json.length; i++) {
						var item = json[i];
						if (item.xData != undefined
								&& item.xData != null
								&& item.xData != "") {
							xDataList.push(item.xData);
						} else {
							xDataList.push("");
						}
					}
					return xDataList;
				}

				/*
				 * following function returns a list of data which will plot on
				 * y axis.
				 */
				function getYDataListFromJson(json,index) {
					var yDataList = [];
					for (var i = 0; i < json.length; i++) {
						var item = json[i];
						if(index == null){
							if (item.yData != undefined && item.yData != null && item.yData != "") {
								yDataList.push(item.yData);
							} else {
								yDataList.push("0");
							}
						}else{
							if (item.yData1 != undefined && item.yData1 != null && item.yData1 != "") {
								yDataList.push(item.yData1);
							} else {
								yDataList.push("0");
							}
						}
					}
					return yDataList;
				}

				/*
				 * following function returns list of data read from the grid in
				 * its actual format.(Ex. $2100, 2000 RS.)
				 */
				function getFormattedDataListFromJson(json,index) {
					var formattedDataList = [];
					for (var i = 0; i < json.length; i++) {
						var item = json[i];
						if(index == null){
							if (item.formattedData != undefined
									&& item.formattedData != null
									&& item.formattedData != "") {
								formattedDataList.push(item.formattedData);
							} else {
								formattedDataList.push("0");
							}
						}else{
							if (item.formattedData1 != undefined
									&& item.formattedData1 != null
									&& item.formattedData1 != "") {
								formattedDataList.push(item.formattedData1);
							} else {
								formattedDataList.push("0");
							}
						}
					}
					return formattedDataList;
				}

				/*
				 * following function generates an array of different colors
				 * which highlights in bars.
				 */
				function getColorArrayForGraph(size) {
					var colorArray = [];
					for (var i = 0; i < size; i++) {
						colorArray.push(randomColorGenerator());
					}
					return colorArray;
				}

				/* following function generates random colors. */
				function randomColorGenerator() {
					var o = Math.round, r = Math.random, s = 255;
					return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',0.4)';
				}

				/*
				 * It's a validator function, which validates input params which
				 * must be required to render the graph.
				 */
				function isValidate( totalRows, totalCols) {
					var flag = false;
					if (totalCols > 0 && totalRows > 0) {
						flag = true;
					} else {
						flag = false;
					}
					return flag;
				}
				
				// grid color generator function which returns an array.
				function getGridColorArrayForX(size){
					var gridColorArray = [];
					for(var i=0; i < size ; i++){
						gridColorArray.push("rgb(255, 255, 255)");
					}
					return gridColorArray;
				}
				
				// grid color generator function which returns an array.
				function getGridColorArrayForY(size){
					var gridColorArray = [];
					for(var i=0; i < size ; i++){
						gridColorArray.push("rgb(255, 255, 255)");
					}
					return gridColorArray;
				}
            
            }// end of plot function
        
        })
}());
// @ sourceURL=ChartJSBarLineComboChart.js
