function getRandomColor() {
    let color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`

    return color;
}

function createRemoveButton(target, x, y, removeButton, containerId){

    removeButton = d3.select(`#${containerId}`).append("button")
    .text("Remove")
    .attr("id", "remove-button")
    .style("position", "relative")
    .style("top", `${y}px`)
    .style("left", `${x}px`)
    .style("z-index", "1000")
    .on("click", () => {
        target.remove()
        removeButton.remove()
    })

    return removeButton
}

function drawCircle(svg){

    // generate variables
    svg.on("click", (event) => {
        const [x, y] = d3.pointer(event)

        // create the circle
        let circle = svg.append('g').append("ellipse")
            .attr('cy', `${y}px`)
            .attr('cx', `${x}px`)
            .attr('rx', 20)
            .attr('ry', 10)
            .attr('fill', 'rgba(255, 0, 0, 0.5)')
            .style("cursor", "pointer")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            )
        })

    function dragstarted(event) {
        d3.select(this).attr("stroke", "black");

    }

    function dragged(event) {
        d3.select(this).attr("cx", `${event.x}px`).attr("cy", `${event.y}px`)
    }

    function dragended(event) {
        d3.select(this).attr("stroke", null);
    }

}

function drawPolygon(svg){

    // generate variables
    let dragging = false, drawing = false, startPoint;
    let points = [], g;
    let startX, startY
    
    // event listeners on the svg
    svg.on('mouseup', function(event){

        // check if the left mouse button is clicked
        if(event.button === 2){
            return        
        }

        drawing = true;
        startPoint = [d3.pointer(event)[0], d3.pointer(event)[1]];

        // if class drawPoly does not exist, create it
        if(svg.select('g.drawPoly').empty()) g = svg.append('g').attr('class', 'drawPoly');

        // if user clicks on the existed points, close the polygon
        if(event.target.hasAttribute('is-handle')) {
            closePolygon();
            return;
        };
    
        points.push(d3.pointer(event));
        g.select('polyline').remove();
    
        let polyline = g.append('polyline').attr('points', points)
                        .style('fill', 'none')
                        .attr('stroke', '#000');
    
        for(var i = 0; i < points.length; i++) {
            g.append('circle')
            .attr('cx', points[i][0])
            .attr('cy', points[i][1])
            .attr('r', 4)
            .attr('fill', 'yellow')
            .attr('stroke', '#000')
            .attr('is-handle', 'true')
            .style({cursor: 'pointer'});
        }
    });
    
    function closePolygon() {

        svg.select('g.drawPoly').remove();
        var g = svg.append('g');
        g.append('polygon')
        .attr('points', points)
        .style('fill', getRandomColor())
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
        )
        .style("cursor", "pointer")
        points.splice(0);

        drawing = false;
    }
    
    svg.on('mousemove', function(event) {
        if(!drawing) return;
        var g = d3.select('g.drawPoly');
        g.select('line').remove();
        var line = g.append('line')
                    .attr('x1', startPoint[0])
                    .attr('y1', startPoint[1])
                    .attr('x2', d3.pointer(event)[0] + 2)
                    .attr('y2', d3.pointer(event)[1])
                    .attr('stroke', '#53DBF3')
                    .attr('stroke-width', 1);
    })
    
    function dragstarted(event) { 
        startX = event.x
        startY = event.y
        d3.select(this.parentNode).select("polygon").attr("stroke", "black");
    }


    function dragged(event) {
    
        let offSetX = event.x - startX
        let offSetY = event.y - startY
        d3.select(this.parentNode).select("polygon").attr("transform", `translate(${offSetX}, ${offSetY})`)

    }

    function dragended(event) {
        let offSetX = event.x - startX
        let offSetY = event.y - startY

        let newPoints = []
        let points = convertPolygonPointsTextToArray(d3.select(this.parentNode).select("polygon").attr("points"))

        points.forEach(point => {
            newPoints.push([point[0] + offSetX, point[1] + offSetY])
        })
        
        let g = d3.select(this.parentNode)
        g.select("polygon").remove()

        g.append('polygon')
        .attr('points', newPoints)
        .style('fill', getRandomColor())
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
        )
        .style("cursor", "pointer")

    }
    


}

function drawLine(svg){

    // generate variables
    let startPoint, g, startX, startY, marker
    let drawing = false

    // event listeners on the svg
    svg.on("mouseup",(event) => {
        
        // check if the left mouse button is clicked
        if(event.button === 0){
            // if the drawing is true, then we are in the middle of drawing a line, so we need to end the drawing
            if(drawing){
                // remove the g element that contains the line of status drawing
                svg.select("g.draw-line").remove()

                // get the x and y coordinates of the mouse pointer
                let x2 = d3.pointer(event)[0]
                let y2 = d3.pointer(event)[1]
                let x1 = startPoint[0]
                let y1 = startPoint[1]

                // create the line
                let line = svg.append("g").append("line")
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)
                    .attr('stroke', '#53DBF3')
                    .attr('stroke-width', 6)
                    .attr("marker-end", "url(#triangle)")
                    .style("cursor", "pointer")
                    .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
                    )

                // set variables to default
                    drawing = false
                    startPoint.splice(0)
                    return
            }

            // if the drawing is false, then we are not in the middle of drawing a line, so we need to start drawing
            if(!drawing){
                startPoint = d3.pointer(event) 
                g = svg.append("g").attr("class","draw-line")
                drawing = true
            }
        
        }
    })

    // event listener for the mouse move when user moves the mouse to stretch the line
    svg.on("mousemove", (event) => {
        if(!drawing) return // if the drawing is false, do nothing

        let [x2, y2] = d3.pointer(event)
        
        if(!marker){
            marker = svg.append("g:defs").append("g:marker")
            .attr("id", "triangle")
            .attr("refX", 0)
            .attr("refY", 2)
            .attr("markerWidth", 6)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .style("fill", "#53DBF3")
            .append("path")
            .attr("d", "M 0 0 3 2 0 4")
            .attr("stroke", "53DBF3");
        }
            g.select("line").remove()

            g.append("line")
            .attr("x1", startPoint[0])
            .attr("y1", startPoint[1])
            .attr("x2", x2)
            .attr("y2", y2)
            .attr('stroke',"#53DBF3")
            .attr('stroke-width', 6)
            .attr("marker-end", "url(#triangle)");

    })

    function dragstarted(event) { 
        startX = event.x
        startY = event.y
    }

    function dragged(event) {
        let offSetX = event.x - startX
        let offSetY = event.y - startY
        d3.select(this.parentNode).select("line").attr("transform", `translate(${offSetX}, ${offSetY})`)    
    }

    function dragended(event) {
        let offSetX = event.x - startX
        let offSetY = event.y - startY

        let line = d3.select(this)
        let g = d3.select(this.parentNode)
        let x1 = parseFloat(line.attr("x1"))
        let y1 = parseFloat(line.attr("y1"))
        let x2 = parseFloat(line.attr("x2"))
        let y2 = parseFloat(line.attr("y2"))
        
        x1 = x1 + offSetX
        y1 = y1 + offSetY
        x2 = x2 + offSetX
        y2 = y2 + offSetY
        
        line.remove()
        g.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr('stroke', '#53DBF3')
        .attr('stroke-width', 6)
        .attr("marker-end", "url(#triangle)")
        .style("cursor", "pointer")
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
        )
    }
}
