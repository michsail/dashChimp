(function() {

    var module = angular.module('app.dashboard');

    module.directive('template', ['$log','$compile','$timeout','read','update','$stateParams', function($log, $compile, $timeout, read, update, $stateParams) {
	    
		return {
			restrict: 'E',
			templateUrl: 'app/template/template.html',
            replace:true,
            controllerAs: '$ctrl',
            bindToController: true,
			controller: controller
		}
		
		function controller ($scope, $element) {

            var $ctrl = this;

            // Array to object
            function toObject(arr) {
                var rv = {};
                for (var i = 0; i < arr.length; ++i)
                    if (arr[i] !== undefined) rv[i] = arr[i];
                return rv;
            }

            $ctrl.pageClass = $stateParams.movementType;

            $ctrl.title = 'New Template Structure';

            // Read the Template
            
            $ctrl.readTemplate = function () {

                read.template().success(function(data){

                    $ctrl.model = data[0];

                    // Order Template Before Render
                    $ctrl.model.structure = _.orderBy($ctrl.model.structure, ['order'], ['asc']); 

                })
            
            }

            $ctrl.readTemplate();

            // Update the Template
            
            $ctrl.updateTemplate = function () {

                console.log('Update Template');

                var postTemplate = angular.copy($ctrl.model);

                postTemplate.structure = toObject(postTemplate.structure); 

                update.template(postTemplate).success(function(data){
                    console.log('Post Update Data');
                    console.log(data);
                    $ctrl.readTemplate()
                })
            
            }

            // Add Header
            addHeader = function() {
                var index = _.size($ctrl.model.structure);
                $ctrl.model.structure[index] = {
                    order: index,
                    type: "Header",
                    title: "New Header"
                }
            }

            // Add Sub Header
            addSubHeader = function() {
                var index = _.size($ctrl.model.structure);
                $ctrl.model.structure[index] = {
                    order: index,
                    type: "Sub Header",
                    title: "This is a sub-header, it can also be used to output the result of a function (There will be COUNT(DATA 1) Sales this year)"
                }
            }

            // Add Bar Graph
            addBarGraph = function() {
                var index = _.size($ctrl.model.structure);
                $ctrl.model.structure[index] = {
                    order: index,
                    series: [],
                    type: "Bar Graph",
                    title: "Bar Graph Heading - Click to Edit",
                    x: {},
                    y: {}
                }
            }

            // Add Pie Graph
            addPieGraph = function() {
                var index = _.size($ctrl.model.structure);
                $ctrl.model.structure[index] = {
                    order: index,
                    series: [],
                    type: "Pie Graph",
                    title: "Pie Graph Heading - Click to Edit"
                }
            }

            $scope.$watch('template.model.structure', function () {
                console.log('Do ng-Repeat');
            });

            // Delete from Template

            $ctrl.deleteFromTemplate = function(templatePart, index) {

                console.log('Delete From Template');

                // Delete templatePart from structure
                $ctrl.model.structure.splice(index, 1)

                // Update Template Part Orders

                _.each($ctrl.model.structure, function (o, i) {
                    o.order = i;
                })
                
                // Update the Database
                $ctrl.updateTemplate();
            }

            // Change Template

            $ctrl.changeTemplate = function(templatePart) {

                // Update the template with the new Template Part
                $ctrl.model.structure[templatePart.order] = templatePart;
                
                // Update the Database
                $ctrl.updateTemplate();
            }

            // Main Area

            $( ".template-area" ).droppable({
                accept: ".template-object",
                drop: function( event, ui ) {

                    var objectType = $(ui.helper).data().template;

                    switch (objectType) {
                        case "header":
                            console.log('Header');
                            $scope.$apply(addHeader());
                            break;
                        case "subheader":
                        console.log('sub');
                            $scope.$apply(addSubHeader());
                            break;
                        case "bargraph":
                        console.log('bar');
                            $scope.$apply(addBarGraph());
                            break;
                        case "piegraph":
                        console.log('pie');
                            // $scope.$apply(addPieGraph());
                    }

                    $ctrl.updateTemplate();

                }
            });

            // Left Menu

            $( ".template-object" ).draggable({
                helper: "clone",
                zIndex: 100
            });

            // Right Menu

            $( ".template-data-object" ).draggable({
                helper: "clone",
                zIndex: 100
            });

            // Main Area

            var moveArray = function (array, originalPosition, newPosition) {
                array.splice(newPosition, 0, array.splice(originalPosition, 1)[0]);
                console.log('array');
                console.log(array);
            };

            var originalPosition, newPosition;

            $( ".sortable-objects" ).sortable({
                handle: ".drag",
                helper: "clone",
                forceHelperSize: true,
                forcePlaceholderSize: true,
                items: ".area-object",
                revert: true,
                axis: "y",
                tolerance: "pointer",
                start: function(event, ui) {
                    // Get the original position
                    originalPosition = ui.item.index();
                },
                stop: function(event, ui) {

                    // Get the new position
                    newPosition = ui.item.index();

                    // Update the index order of the array
                    moveArray($ctrl.model.structure, originalPosition, newPosition);

                    // Update the order property of objects in the array
                    _.each($ctrl.model.structure, function(o, i){
                        o.order = i;
                    })

                    // Update the Database
                    $ctrl.updateTemplate();

                }
            });
            
            // Example Model 

            var model = {
                0: {
                    template:'<template-objects-header ng-model="object"></template-objects-header>',
                    title:'Best Header Yet',
                    order: 1
                },
                1: {
                    template:'<template-objects-subheader ng-model="object"></template-objects-subheader>',
                    title:'Best Sub Header Yet',
                    order: 2
                },
                2: {
                    template:'<template-objects-bar ng-model="object"></template-objects-bar>',
                    title:'Sales Per Quarter',
                    x: { name: 'DATE', color: 'default'},
                    y: { name: 'DATA 1', color: 'A'},
                    series:[
                        {
                            name:'DATA 7',
                            color:'G'
                        },
                        {
                            name:'DATA 2',
                            color:'B'
                        },
                        {
                            name:'DATA 3',
                            color:'C'
                        }
                    ],
                    order: 3
                },
                3:  {
                    template:'<template-objects-bar ng-model="object"></template-objects-bar>',
                    title:'Sales Per Annum',
                    x: { name: 'DATE', color: 'default'},
                    y: { name: 'DATA 4', color: 'D'},
                    series:[
                        {
                            name:'DATA 3',
                            color:'C'
                        },
                        {
                            name:'DATA 4',
                            color:'D'
                        },
                        {
                            name:'DATA 5',
                            color:'E'
                        },
                        {
                            name:'DATA 1',
                            color:'A'
                        }
                    ],
                    order: 4
                }
            };

            // console.log(JSON.stringify(model));

		}
		
    	
    }]);
  
})();