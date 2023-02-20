define( ["qlik", "text!./MultiRangeSlider.html", "css!./MultiRangeSlider.css"],
	function ( qlik, template ) {
		"use strict";
		return {
			template: template,
            definition: {
				type: "items",
				component: "accordion",
				items: {
					appearance: {
						uses: "settings",
						items: {
							variable: {
								type: "items",
								label: "Variable",
								items: {
									minvariable: {
										ref: "minVarName",
										type: "string",
										label: "Min Variable Name",
										expression:"optional"
									},
									maxvariable: {
										ref: "maxVarName",
										type: "string",
										label: "Max Variable Name",
										expression:"optional"
									}							
								}
							},
							slider: {
								type: "items",
								label: "Slider",
								items: {
									slidermin: {
										ref: "sliderMin",
										type: "number",
										label: "Min",
										defaultValue:1,
										expression:"optional"
									},
									slidermax: {
										ref: "sliderMax",
										type: "number",
										label: "Max",
										defaultValue:100,
										expression:"optional"
									},
									sliderstep: {
										ref: "sliderStep",
										type: "number",
										label: "Step",
										defaultValue:1,
										expression:"optional"
									}					
								}
							},
							colorpick: {
								type: "items",
								label: "Colors",
								items: {
									sliderColor: {
										ref: "sliderColor",
										type: "object",
										component: "color-picker",
										label: "Slider button",
										defaultValue: {color:"#00873d"}
									},
									rangeColor: {
										ref: "rangeColor",
										type: "object",
										component: "color-picker",
										label: "Range",
										defaultValue: {color:"#00873d"}
									},
									trackColor: {
										ref: "trackColor",
										type: "object",
										component: "color-picker",
										label: "Track",
										defaultValue: {color:"#e5e3e2"}
									}	
								}
							}

						}

					}
				}
			},
			support: {
				snapshot: true,
				export: true,
				exportData: true
			},
			paint: function ($element, layout) {
				console.log("paint");
				const qObjID = '#' + this.options.id + "_content";
				const inputA = document.querySelector(qObjID + " #inputA");
				const inputB = document.querySelector(qObjID + " #inputB");
				const thumbA = document.querySelector(qObjID + " .slider > .thumb.A");
				const thumbB = document.querySelector(qObjID + " .slider > .thumb.B");
				const labelA = document.querySelector(qObjID + " .multiRangeLabelwrap > .multiRangeLabelA");
				const labelB = document.querySelector(qObjID + " .multiRangeLabelwrap > .multiRangeLabelB");
				const range  = document.querySelector(qObjID + " .slider > .range");
				const track  = document.querySelector(qObjID + " .slider > .track");
				const thumbSize = thumbA.offsetWidth;
				const app = qlik.currApp(this);
				const setRangeValue = () => {
					//calc % of range
					const percentA = ((inputA.value - inputA.min) / (inputA.max - inputA.min)) * 100;
					const percentB = ((inputB.value - inputB.min) / (inputB.max - inputB.min)) * 100;
					//label text
					labelA.innerHTML = inputA.value;
					labelB.innerHTML = inputB.value;
					//label x location
					labelA.style.left = "calc(" + percentA + "% - " + (labelA.offsetWidth*percentA/200) + "px)";
					labelB.style.left = "calc(" + percentB + "% - " + (labelB.offsetWidth*percentB/200) + "px)";
					//input, thumb Moving
					thumbA.style.left = "calc(" + percentA + "% - " + (thumbSize*percentA/100) + "px)";
					thumbB.style.left = "calc(" + percentB + "% - " + (thumbSize*percentB/100) + "px)";
					//color range
					range.style.left = Math.min(percentA, percentB) + "%";
					range.style.right = 100 - Math.max(percentA, percentB) + "%";
					//console.log("setRangeValue", inputA.min, inputA.max, inputA.step);
				};
				
				//슬라이더 초기값 설정, min/max 변수의 값을 불러와 슬라이더에 설정
				app.variable.getByName(layout.minVarName).then(function(variable){
					variable.getLayout().then(function(variableLayout) {
						//console.log("variableLayout", variableLayout);
						//변수가 설정 되지 않았으면 슬라이더 최소값/최대값으로 초기값 설정
						inputA.value = (isNaN(variableLayout.qNum)||layout.minVarName==null||layout.minVarName.trim()===""?layout.sliderMin:variableLayout.qNum);
					});
				}).then(function(){
					app.variable.getByName(layout.maxVarName).then(function(variable){
						variable.getLayout().then(function(variableLayout) {
							//console.log("variableLayout", variableLayout.qNum);
							inputB.value = (isNaN(variableLayout.qNum)||layout.maxVarName==null||layout.maxVarName.trim()===""?layout.sliderMax:variableLayout.qNum);
							//슬라이더 초기화 함수 호출
							setRangeValue();
						});
					})
				});

				//const setSlider = () => {
					//Slider setup
					inputA.min = layout.sliderMin;
					inputA.max = layout.sliderMax;
					inputA.step = layout.sliderStep;
					inputB.min = layout.sliderMin;
					inputB.max = layout.sliderMax;
					inputB.step = layout.sliderStep;
					//console.log("slider", layout.sliderMin, layout.sliderMax, layout.sliderStep);
					track.style.background = layout.trackColor.color;
					range.style.background = layout.rangeColor.color;
					thumbA.style.background = layout.sliderColor.color;
					thumbB.style.background = layout.sliderColor.color;
					//console.log("color", layout.sliderColor.color, layout.rangeColor.color, layout.trackColor.color);				  
				//};
				
				const setVariableValue = () => {
					app.variable.setNumValue(layout.minVarName, Math.min(inputA.value,inputB.value));
					app.variable.setNumValue(layout.maxVarName, Math.max(inputA.value,inputB.value));
					//console.log("setVariableValue");
				};

				//Slider 변경시 thumb만 이동
				inputA.addEventListener("input", setRangeValue);
				inputB.addEventListener("input", setRangeValue);
				//Slider 이동 완료시 변수값 변경
				inputA.addEventListener("change", setVariableValue);
				inputB.addEventListener("change", setVariableValue);
				
				//setVariableValue();
				
				/*if (!this.initialized) {
					this.initialized = true;
					console.log('initialized', this.initialized);
				}*/

				//this.$scope.selections = [];
				return qlik.Promise.resolve();
			}
		};

	} );
