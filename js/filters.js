'use strict';

/* Filters */
d3DemoApp.filter('treefilter', function () {

  return function( items, name ) {
      
      var filtered = [];
      angular.forEach(items, function(item) {
          if(item.name.indexOf(name) !== -1 || typeof name == 'undefined') {
            filtered.push(item);
          }
      });
      
      $scope.treedatascope2 = {
            name: "/",
            contents: [
                    {
                        name: "blibli",
                        contents: [
                            { name: "Mail.app" },
                            { name: "Pages.app" }
                        ]
                    }
                ]
            };


      return filtered;
    };
});
