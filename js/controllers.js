'use strict';

/* Controllers */

// controller business logic
d3DemoApp.controller('AppCtrl', function AppCtrl ($scope, $http) {

  $scope.treedatascope1 = {
    name: "/",
    children: [
            {
                name: "haba",
                children: [
                    { name: "Mail.app" },
                    { name: "Pages.app" }
                ]
            }
        ]
    };

  $scope.treedatascope2 = {
    name: "root",
    children: [
            {
                name: "anguuuuular",
                children: [
                    { name: "Mail.app" },
                    { name: "Pages.app" }
                ]
            },
            {
                name: "thenextone",
                children: [
                    { name: "thatsit" },
                    { name: "booooh" }
                ]
            }
        ]
    };



});
