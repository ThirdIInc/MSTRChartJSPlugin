(function () {
    if (!mstrmojo.plugins.ChartJSPieChart) {
        mstrmojo.plugins.ChartJSPieChart = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.vi.models.editors.CustomVisEditorModel",
        "mstrmojo.array"
    );

    var $WT = mstrmojo.vi.models.editors.CustomVisEditorModel.WIDGET_TYPE;

    mstrmojo.plugins.ChartJSPieChart.ChartJSPieChartEditorModel = mstrmojo.declare(
        mstrmojo.vi.models.editors.CustomVisEditorModel,
        null,
        {
            scriptClass: "mstrmojo.plugins.ChartJSPieChart.ChartJSPieChartEditorModel",
            cssClass: "d3wordcloudeditormodel",
            getCustomProperty: function getCustomProperty() {
                var myViz = this.getHost();
                var isScale = false;
                return [
                    {
                        name: "Word Cloud",
                        value: [
                            {
                                style: $WT.LABEL,
                                labelText: "Text"
                            },
                            {
                                style: $WT.CHARACTERGROUP,
                                propertyName: "textFont",
                                items: [
                                    {
                                        childName: 'fontSize',
                                        disabled: true
                                    },
                                    {
                                        childName: 'fontStyle',
                                        disabled: true
                                    },
                                    {
                                        childName: 'fontColor',
                                        disabled: myViz.getProperty("defaultcolors") === "true"
                                    }

                                ]
                            },
                            {
                                style: $WT.CHECKBOXANDLABEL,
                                propertyName: "defaultcolors",
                                labelText: "Set Default Colors"
                            },
                            {
                                style: $WT.EDITORGROUP,
                                items: [
                                    {
                                        style: $WT.LABEL,
                                        labelText: "Layout"
                                    },
                                    {
                                        style: $WT.TWOCOLUMN,
                                        items: [
                                            {
                                                style: $WT.LABEL,
                                                width: "20%",
                                                labelText: "Spiral:"
                                            },
                                            {
                                                style: $WT.CHECKLIST,
                                                width: "80%",
                                                propertyName: "spiral",
                                                items: [
                                                    {
                                                        labelText: "Ellipse",
                                                        propertyName: "a"
                                                    },
                                                    {
                                                        labelText: "Rectangular",
                                                        propertyName: "b"
                                                    }
                                                ],
                                                orientation: "v",
                                                multiSelect: false
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                style: $WT.TWOCOLUMN,
                                items: [
                                    {
                                        style: $WT.LABEL,
                                        width: "20%",
                                        labelText: "Scale:"
                                    },
                                    {
                                        style: $WT.BUTTONBAR,
                                        width: "80%",
                                        propertyName: "scales",
                                        items: [
                                            {
                                                labelText: "+",
                                                propertyName: "inc"
                                            },
                                            {
                                                labelText: "-",
                                                propertyName: "dec"
                                            }
                                        ],
                                        config: {
                                            suppressData: true,
                                            onPropertyChange: function (propertyName, newValue) {
                                                if (newValue.inc === "true") {
                                                    isScale = true;
                                                }
                                                return {};
                                            },
                                            callback: function () {
                                                myViz.setScaleValue(isScale);
                                                myViz.refresh();
                                            }
                                        },
                                        multiSelect: false
                                    }
                                ]
                            },
                            {
                                style: $WT.TWOCOLUMN,
                                items: [
                                    {
                                        style: $WT.LABEL,
                                        width: "60%",
                                        labelText: "Minimum Font Size:"
                                    },
                                    {
                                        style: $WT.STEPPER,
                                        width: "40%",
                                        propertyName: "minfont",
                                        min: 5,
                                        max: 50
                                    }
                                ]
                            },
                            {
                                style: $WT.TWOCOLUMN,
                                items: [
                                    {
                                        style: $WT.LABEL,
                                        width: "60%",
                                        labelText: "Maximum Font Size:"
                                    },
                                    {
                                        style: $WT.STEPPER,
                                        width: "40%",
                                        propertyName: "maxfont",
                                        min: 50,
                                        max: 200
                                    }
                                ]
                            },
                            {
                                style: $WT.TWOCOLUMN,
                                items: [
                                    {
                                        style: $WT.LABEL,
                                        width: "60%",
                                        labelText: "Number of Words:"
                                    },
                                    {
                                        style: $WT.STEPPER,
                                        width: "40%",
                                        propertyName: "numofwords",
                                        min: 1,
                                        max: 250
                                    }
                                ]
                            }

                        ]
                    }
                ]


            }
        })
}());
//@ sourceURL=D3WordCloudEditorModel.js