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

// if we don't initialize it here, something with the scope is going wrong
var i = 0;

function update(layoutRoot, tree, rootOfTree, clickedNode) {
    
    if(typeof clickedNode == 'undefined') {
        clickedNode = rootOfTree;
    }

    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    var diagonal = d3.svg.diagonal()
                     .projection(function(d) { return [d.y, d.x]; });

    var source = clickedNode;

  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(rootOfTree).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });


  // Update the nodes#
  var node = layoutRoot.selectAll("g.node")
                       .data(nodes, function(d) { 
                           var idToRet = d.id || (d.id = ++i);
                           return  idToRet
                       });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) { 
          toggle(d); 
          update(layoutRoot, tree, rootOfTree, d, i); 
      });

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links#
  var link = layoutRoot.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

d3DemoApp.directive('d3Tree', function () {
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

            scope.$watch('treedatafilter', function(newVal, oldVal){
                var clonedTreeData = JSON.parse(JSON.stringify(treeData));
                clonedTreeData.x0 = size.height / 2;
                clonedTreeData.y0 = 0;
                scope.clonedTreeData = clonedTreeData;

                // Initialize the display to show a few nodes.
                if(typeof newVal == 'undefined') {
                    clonedTreeData.children.forEach(toggleAll);
                    // toggle(clonedTreeData.children[1]);
                }
            
                var clonedTreeData = scope.clonedTreeData;
                var filterValue = newVal;

                if(clonedTreeData.children) {
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
                }
                 
                update(layoutRoot, tree, clonedTreeData, clonedTreeData);                           
            });
            
         }
    };
});
