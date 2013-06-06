'use strict';

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}
function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
}

function update(layoutRoot, tree, link, scope, filterValue) {

    var clonedTreeData = scope.clonedTreeData;

                for(var i = 0; i < clonedTreeData.children.length; i++) {
                    if(clonedTreeData.children[i].children) {
                        for(var j = 0; j < clonedTreeData.children[i].children.length; j++){
                            var name = clonedTreeData.children[i].children[j].name;
                            if((!!filterValue) && name.indexOf(filterValue) === -1) {
                                clonedTreeData.children[i].children.splice(j, 1);
                                //if we don't decrease j, it will point to the wrong index
                                j--;
                            }
                        }
                    }
                }

               var nodes = tree.nodes(clonedTreeData);
                var links = tree.links(nodes);

                layoutRoot.selectAll('*').remove();

                layoutRoot.selectAll("path.link")
                           .data(links)
                           .enter()
                           .append("svg:path")
                           .attr("class", "link")
                           .attr("d", link);

                /*
                     Nodes as
                     <g class="node">
                         <circle class="node-dot" />
                         <text />
                     </g>
                  */
                 var nodeGroup = layoutRoot.selectAll("g.node")
                     .data(nodes)
                     .enter()
                     .append("svg:g")
                     .attr("class", "node")
                     .on("click", function(d) { 
                         toggle(d); 
                         update(layoutRoot, tree, link, scope, filterValue); 
                     })
                     .attr("transform", function(d)
                     {
                         return "translate(" + d.y + "," + d.x + ")";
                     });

                 nodeGroup.append("svg:circle")
                     .attr("class", "node-dot")
                     .attr("r", 5);

                 nodeGroup.append("svg:text")
                          .attr("text-anchor", function(d)
                           {
                               return d.children ? "end" : "start";
                           })
                          .attr("dx", function(d)
                           {
                                var gap = 2 * 5;
                                return d.children ? -gap : gap;
                           })
                          .attr("dy", 3)
                          .text(function(d)
                           {
                                return d.name;
                           });


}

d3DemoApp.directive('demoElem', function () {
    return {
        restrict: 'E',
        scope: {
            treedatafilter: '='
        },
        link: function (scope, element, attrs) {
        

        // Calculate total nodes, max label length
        var maxLabelLength = 19;

        var size = {};
        size.width = 1074;
        size.height = 300;
        var colorToFill = 'red';
        var treeData = scope.$parent.treedatascope2;

        var tree = d3.layout.tree()
                            .sort(null)
                            .size([size.height, size.width - maxLabelLength*12])
                            .children(function(d)
                            {
                                return (!d.children || d.children.length === 0) ? 
                                null : 
                                d.children;
                            });

        
        /*
             <svg>
                 <g class="container" />
             </svg>
          */
         var layoutRoot = d3.selectAll(element)
                            .append("svg:svg")
                                .attr("width", size.width)
                                .attr("height", size.height)
                            .append("svg:g")
                                .attr("class", "container")
                                .attr("transform", "translate(" + maxLabelLength + ",0)");

        // Edges between nodes as a <path class="link" />
         var link = d3.svg.diagonal()
                          .projection(function(d)
                            {
                                return [d.y, d.x];
                            });

            scope.$watch('treedatafilter', function(newVal, oldVal){
                var clonedTreeData = JSON.parse(JSON.stringify(treeData));
                scope.clonedTreeData = clonedTreeData;

                // Initialize the display to show a few nodes.
                if(typeof newVal == 'undefined') {
                    clonedTreeData.children.forEach(toggleAll);
                    toggle(clonedTreeData.children[1]);
                }
                
                update(layoutRoot, tree, link, scope, newVal);                           
            });
            
            
         }
    };
});
