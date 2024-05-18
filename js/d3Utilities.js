function getRandomColor() {
    let color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`

    return color;
}

function unSelectAllElements(svg) {
    svg.selectAll('.selected').classed('selected', false);
    svg.selectAll('.select-border').attr('stroke', 'none')
    svg.selectAll('.bot-left, .bot-right, .top-left, .top-right').attr('fill', 'none')
}

function createRemoveButton(target, x, y, removeButton, containerId) {

    removeButton = d3.select(`#${containerId}`).append("button")
        .text("Remove")
        .attr("id", "remove-button")
        .style("position", "absolute")
        .style("top", `${y}px`)
        .style("left", `${x}px`)
        .style("z-index", "1000")
        .on("click", () => {

            if (target.id === "screenshot-svg") {
                removeButton.remove()
            } else {
                target.remove()
                removeButton.remove()
            }

        })

    return removeButton
}

function drawCircle(svg) {
    let transformX = 0,
        transformY = 0

    svg.on("click", (event) => {
        unSelectAllElements(svg)
        const [x, y] = d3.pointer(event)

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

        let circle = d3.select(this)
        circle.attr("stroke", "black");
        let transform = circle.attr("transform")
        if (transform) {
            let translate = transform.split("(")[1].split(")")[0].split(",")
            transformX = parseFloat(translate[0])
            transformY = parseFloat(translate[1])
        }
        d3.select(this).attr("transform", `translate(${transformX}, ${transformY})`)

    }

    function dragged(event) {
        transformX += event.dx
        transformY += event.dy
        d3.select(this).attr("transform", `translate(${transformX}, ${transformY})`)
    }

    function dragended(event) {
        d3.select(this).attr("stroke", null);
        [transformX, transformY] = [0, 0]

    }
}

function drawPolygon(svg) {

    // generate variables
    let drawing = false,
        startPoint, transformX = 0, transformY = 0,
        points = [], polygon,
        g,
        startX, startY

    // event listeners on the svg
    svg.on('mouseup', function(event) {
        unSelectAllElements(svg)
        // check if the left mouse button is clicked
        if (event.button === 2) {
            return
        }

        drawing = true;
        startPoint = [d3.pointer(event)[0], d3.pointer(event)[1]];

        // if class drawPoly does not exist, create it
        if (svg.select('g.drawPoly').empty()) g = svg.append('g').attr('class', 'drawPoly');

        // if user clicks on the existed points, close the polygon
        if (event.target.hasAttribute('is-handle')) {
            closePolygon();
            return;
        };

        points.push(d3.pointer(event));
        g.select('polyline').remove();

        let polyline = g.append('polyline').attr('points', points)
            .style('fill', 'none')
            .attr('stroke', '#000');

        for (var i = 0; i < points.length; i++) {
            g.append('circle')
                .attr('cx', points[i][0])
                .attr('cy', points[i][1])
                .attr('r', 4)
                .attr('fill', 'yellow')
                .attr('stroke', '#000')
                .attr('is-handle', 'true')
        }
    });

    function closePolygon() {

        svg.select('g.drawPoly').remove();

        g = svg.append('g');
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
        if (!drawing) return;
        g = d3.select('g.drawPoly');
        g.select('line').remove();
        var line = g.append('line')
            .attr('x1', startPoint[0])
            .attr('y1', startPoint[1])
            .attr('x2', d3.pointer(event)[0]   )
            .attr('y2', d3.pointer(event)[1])
            .attr('stroke', '#53DBF3')
            .attr('stroke-width', 1);
    })

    function dragstarted(event) {
        startX = event.x
        startY = event.y
        polygon = d3.select(this)
        
        let transform = polygon.attr("transform")
        if (transform) {
            let translate = transform.split("(")[1].split(")")[0].split(",")
            transformX = parseFloat(translate[0])
            transformY = parseFloat(translate[1])
        }
        polygon.attr("stroke", "black");

    }


    function dragged(event) {   
        transformX += event.dx
        transformY += event.dy
        polygon.attr("transform", `translate(${transformX}, ${transformY})`)
    }

    function dragended(event) {
        [transformX, transformY] = [0, 0]
    }



}

function drawLine(svg) {

    let startPoint, g, marker, transformX = 0,
        transformY = 0,
        line, x1, x2, y1, y2,
        drawing = false

    svg.on("mousedown", (event) => {
        unSelectAllElements(svg)
        if (event.button === 0) {
            if (drawing) return

            if (!drawing) {
                startPoint = d3.pointer(event)
                x1 = startPoint[0]
                y1 = startPoint[1]
                g = svg.append("g").attr("class", "draw-line")
                drawing = true
            }
        }
    })

    svg.on("mousemove", (event) => {
        if (!drawing) return // if the drawing is false, do nothing

        let [x2, y2] = d3.pointer(event)

        if (!marker) {
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

        line = g.select("line")

        if (line.empty()) {
            g.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr('stroke', "#53DBF3")
                .attr('stroke-width', 6)
                .attr("marker-end", "url(#triangle)");
        } else {
            line
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
        }

    })

    // event listeners on the svg
    svg.on("mouseup", (event) => {

        // check if the left mouse button is clicked
        if (event.button === 0) {
            // if the drawing is true, then we are in the middle of drawing a line, so we need to end the drawing
            if (drawing) {
                // remove the g element that contains the line of status drawing
                svg.select("g.draw-line").remove()

                // get the x and y coordinates of the mouse pointer
                let [x2, y2] = d3.pointer(event)

                // create the line
                line = svg.append("g").append("line")
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
            if (!drawing) {
                startPoint = d3.pointer(event)
                g = svg.append("g").attr("class", "draw-line")
                drawing = true
            }

        }
    })

    function dragstarted(event) {
        let line = d3.select(this)
        let transform = line.attr("transform")
        if (transform) {
            let translate = transform.split("(")[1].split(")")[0].split(",")
            transformX = parseFloat(translate[0])
            transformY = parseFloat(translate[1])
        }
    }

    function dragged(event) {
        transformX += event.dx
        transformY += event.dy
        d3.select(this).attr("transform", `translate(${transformX}, ${transformY})`)
    }

    function dragended(event) {
        [transformX, transformY] = [0, 0]
    }
}

function drawSelection(svg) {
    
    let g, startX, startY, endX, endY, 
        drawing = false,
        selecting = false,
        transformX = 0,
        transformY = 0



    svg.on('mousedown', function(event) {
        unSelectAllElements(svg)
        if (event.button === 2) return

        if (event.button === 0) {
            // check đã vẽ xong
            if (selecting && !drawing) {

                selecting = false, drawing = false
                d3.selectAll('.selected').classed('selected', false);
                g.remove()
                startX = null, startY = null, endX = null, endY = null

            } else if (!selecting && !drawing) { //check chưa vẽ
          
                startX = d3.pointer(event)[0]
                startY = d3.pointer(event)[1]

                if (svg.select('g.drawSelection').empty()) g = svg.append('g').attr('class', 'drawSelection');
                drawing = true;
            } else if (drawing && !selecting) { // check đang vẽ

            }
        }

    })




    svg.on('mousemove', function(event) {

        if (!drawing) return;

        endX = d3.pointer(event)[0]
        endY = d3.pointer(event)[1]

        g.select('rect').remove();
        rect = g.append('rect')
            .attr('x', Math.min(startX, endX))
            .attr('y', Math.min(startY, endY))
            .attr('width', Math.abs(endX - startX))
            .attr('height', Math.abs(endY - startY))
            .attr('stroke', '#53DBF3')
            .attr('stroke-width', 6)
            .attr('fill', 'none')
            .style("cursor", "pointer")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
            )


    })

    svg.on('mouseup', function(event) {


        g.remove()
        if (!selecting && drawing) {
            g = svg.append('g')

            rect = g.append('rect')
                .attr('x', Math.min(startX, endX))
                .attr('y', Math.min(startY, endY))
                .attr('width', Math.abs(endX - startX))
                .attr('height', Math.abs(endY - startY))
                .attr('stroke', '#53DBF3')
                .attr('stroke-width', 6)
                .attr('fill', `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.01)`)
                .attr('class', 'selected')
                .style("cursor", "pointer")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
                )
            drawing = false, selecting = true

        }

        

        const allElements = svg.selectAll("g")
        allElements.each(function(d, i) {
            let element = d3.select(this).node()
            let elementBox = element.getBBox()

            let selected = false


            if (elementBox.x > Math.min(startX, endX) &&
                elementBox.x < Math.min(startX, endX) + Math.abs(endX - startX) &&
                elementBox.y > Math.min(startY, endY) &&
                elementBox.y < Math.min(startY, endY) + Math.abs(endY - startY)) {
                selected = true
            }


            if (selected) {
                const childElement = d3.select(this)
                    .attr('class', 'selected')
            }
        })


    })


    function dragstarted(event) {
    
        let selectedList = d3.selectAll('.selected')
        selectedList.each(function(d, i) {
            let element = d3.select(this)
            element.attr("transform", `translate(${transformX}, ${transformY})`)

        })

    }

    function dragged(event) {
        let selectedList = d3.selectAll('.selected')

        transformX += event.dx
        transformY += event.dy
        selectedList.attr("transform", `translate(${transformX}, ${transformY})`)
    }

    function dragended(event) {
        let selectedList = d3.selectAll('.selected')
        selectedList.each(function(d, i) {
            let element = d3.select(this)
            element.attr("transform", `translate(${transformX}, ${transformY})`)
        })
        [transformX, transformY] = [0, 0]

    }

    




}

function drawCurveNatural(svg) {
    let points = [],
        g, drawing = false,
        startPoint, dx, dy, marker, inSwing = false,
        outSwing = false

    if (!marker) {
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
    const curve = d3.line().curve(d3.curveBundle.beta(0.7));

    svg.on('mousedown', function(event) {
        unSelectAllElements(svg)
        if (event.button === 2) outSwing = true
        if (event.button === 0) inSwing = true


        if (!drawing) {
            startPoint = d3.pointer(event)
            points.push(startPoint)
            if (svg.select('g.drawCurveNatural').empty()) g = svg.append('g').attr('class', 'drawCurveNatural');
            drawing = true;
        }
    })

    svg.on('mousemove', function(event) {
        if (!drawing) return;
        let [x, y] = d3.pointer(event)
        dx = x - startPoint[0]
        dy = y - startPoint[1]
        if (inSwing) {
            points[1] = [startPoint[0] - dx * 6 / 10, startPoint[1] + dy * 4 / 10]
            points[2] = [startPoint[0] - dx * 5 / 10, startPoint[1] + dy * 8 / 10]
            points[3] = [startPoint[0] + dx * 4 / 10, startPoint[1] + dy]
            points[4] = [x, y];
        }
        if (outSwing) {
            points[1] = [startPoint[0] + dx * 14 / 10, startPoint[1] + dy * 4 / 10]
            points[2] = [startPoint[0] + dx * 15 / 10, startPoint[1] + dy * 8 / 10]
            points[3] = [startPoint[0] + dx * 12 / 10, startPoint[1] + dy]
            points[4] = [x, y];
        }

        console.log(points[0], points[1], points[2], points[3], points[4])


        g.select('path').remove();

        g.append('path').attr('d', curve(points)).attr('stroke', '#53DBF3').attr('fill', 'none').attr('stroke-width', 3).attr("marker-end", "url(#triangle)");
    })

    svg.on('mouseup', function(event) {
        g.remove()
        g = svg.append('g')

        g.append('path').attr('d', curve(points)).attr('stroke', '#53DBF3').attr('fill', 'none').attr('stroke-width', 6).style("cursor", "pointer").attr("marker-end", "url(#triangle)")

        points.splice(0)
        inSwing = false
        outSwing = false
        drawing = false
    })
}

function drawRectangle(svg) {
    let startPoint, g, startX, startY, endX, endY
    let drawing = false
    let transformX = 0,
        transformY = 0,
        oppositeCorner, oppositeCircle, oppositeCx, oppositeCy
    const cornerMap = {
        'top-left': {
            'opposite': 'bot-right',
            'sameCx': 'bot-left',
            'sameCy': 'top-right'
        },
        'top-right': {
            'opposite': 'bot-left',
            'sameCx': 'bot-right',
            'sameCy': 'top-left'
        },
        'bot-left': {
            'opposite': 'top-right',
            'sameCx': 'top-left',
            'sameCy': 'bot-right'
        },
        'bot-right': {
            'opposite': 'top-left',
            'sameCx': 'top-right',
            'sameCy': 'bot-left'

        }

    }



    svg.on('mousedown', function(event) {
        if (event.button === 2) return
        if (event.button === 0) {

            unSelectAllElements(svg)

            if (!drawing) {
                startPoint = d3.pointer(event)
                startX = d3.pointer(event)[0]
                startY = d3.pointer(event)[1]
                g = svg.append("g").attr("class", "draw-rectangle")
                drawing = true
            }
        }
    })

    svg.on('mousemove', function(event) {
        if (!drawing) return;

        endX = d3.pointer(event)[0]
        endY = d3.pointer(event)[1]

        g.select('rect').remove();
        let rect = g.append('rect')
            .attr('x', Math.min(startX, endX))
            .attr('y', Math.min(startY, endY))
            .attr('width', Math.abs(endX - startX))
            .attr('height', Math.abs(endY - startY))
            .attr('stroke', '#53DBF3')
            .attr('stroke-width', 6)
            .attr('fill', 'none')


    })

    svg.on('mouseup', function(event) {
        g.remove()
        g = svg.append('g')

        let circlePoints = {
            'top-left': [startPoint[0], startPoint[1]],
            'bot-left': [startPoint[0], endY],
            'top-right': [endX, startPoint[1]],
            'bot-right': [endX, endY]

        }

        for (key of Object.keys(circlePoints)) {
            let cx = circlePoints[key][0]
            let cy = circlePoints[key][1]

            g.append('circle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', 10)
                .attr('fill', `none`)
                .attr('class', key)

                .on('mouseover', function(event) {
                    let circle = d3.select(this)
                    let targetClass = circle.attr('class')
                    if (targetClass == 'top-left' || targetClass == 'bot-right') {
                        circle.style("cursor", "se-resize")
                    } else {
                        circle.style("cursor", "sw-resize")
                    }
                })

                .call(d3.drag().on('drag', function(event) {
                        let circle = d3.select(this)
                        let targetClass = circle.attr('class')
                        let g = d3.select(this.parentNode)
                        let sameCxCircle = g.select(`.${cornerMap[targetClass].sameCx}`)
                        let sameCyCircle = g.select(`.${cornerMap[targetClass].sameCy}`)
                        let rect = g.select('rect')
                        let x = event.x
                        let y = event.y

                        if (!oppositeCorner) {
                            oppositeCorner = cornerMap[targetClass].opposite
                            oppositeCircle = g.select(`.${oppositeCorner}`)
                            oppositeCx = oppositeCircle.attr('cx')
                            oppositeCy = oppositeCircle.attr('cy')
                        }

                        rect.attr('x', Math.min(oppositeCx, x)).attr('y', Math.min(oppositeCy, y)).attr('width', Math.abs(oppositeCx - x)).attr('height', Math.abs(oppositeCy - y))


                        circle.attr('cx', x).attr('cy', y)
                        sameCxCircle.attr('cx', x)
                        sameCyCircle.attr('cy', y)
                    })
                    .on('end', function(event) {
                        oppositeCorner = null

                    }))
        }

        if (endX && endY) {

            let rect = g.append('rect')
                .attr('x', Math.min(startX, endX))
                .attr('y', Math.min(startY, endY))
                .attr('width', Math.abs(endX - startX))
                .attr('height', Math.abs(endY - startY))
                .attr('stroke', '#53DBF3')
                .attr('stroke-width', 6)
                .attr('fill', `rgba(0,0,255, 0.05)`)
                .style("cursor", "pointer")
                .on('click', function() {
                    g = d3.select(this.parentNode)
                    let circles = g.selectAll('circle').attr('fill', 'red')
                })
        }



        drawing = false
        startPoint.splice(0)
        endX = null, endY = null
    })


}

function drawFreeHand(svg) {
    let points = [],
        g, drawing = false,
        startPoint


    const curve = d3.line().curve(d3.curveCatmullRom.alpha(1));

    svg.on('mousedown', function(event) {
        if (event.button === 2) return
        if (event.button === 0) {
            if (!drawing) {
                startPoint = d3.pointer(event)
                points.push(startPoint)
                if (svg.select('g.drawFreeHand').empty()) g = svg.append('g').attr('class', 'drawFreeHand');
                drawing = true;
            }
        }

    })

    svg.on('mousemove', function(event) {
        if (!drawing) return;
        let [x, y] = d3.pointer(event)
        points.push([x, y])



        g.select('path').remove();

        g.append('path').attr('d', curve(points)).attr('stroke', '#53DBF3').attr('fill', 'none').attr('stroke-width', 3).attr("marker-end", "url(#triangle)");
    })

    svg.on('mouseup', function(event) {
        g.remove()
        g = svg.append('g')

        g.append('path').attr('d', curve(points)).attr('stroke', '#53DBF3').attr('fill', 'none').attr('stroke-width', 6).style("cursor", "pointer").attr("marker-end", "url(#triangle)")

        points.splice(0)
        drawing = false
    })
}

function drawEllipseArea(svg) {
    let startPoint, g, startX, startY, endX, endY, oppositeCx, oppositeCy, oppositeCorner, oppositeCircle
    let drawing = false
    let transformX = 0,
        transformY = 0

    const cornerMap = {
        'top-left': {
            'opposite': 'bot-right',
            'sameCx': 'bot-left',
            'sameCy': 'top-right'
        },
        'top-right': {
            'opposite': 'bot-left',
            'sameCx': 'bot-right',
            'sameCy': 'top-left'
        },
        'bot-left': {
            'opposite': 'top-right',
            'sameCx': 'top-left',
            'sameCy': 'bot-right'
        },
        'bot-right': {
            'opposite': 'top-left',
            'sameCx': 'top-right',
            'sameCy': 'bot-left'

        }

    }


    svg.on('mousedown', function(event) {

        unSelectAllElements(svg)
        if (event.button === 2) return
        if (event.button === 0) {

            if (!drawing) {
                startPoint = d3.pointer(event)
                if (svg.select('g.drawEllipseArea').empty()) g = svg.append('g').attr('class', 'drawEllipseArea');
                drawing = true;
            }
        }




    })

    svg.on('mousemove', function(event) {
        if (!drawing) return;

        endX = d3.pointer(event)[0]
        endY = d3.pointer(event)[1]
        let cx = startPoint[0] + (endX - startPoint[0]) / 2
        let cy = startPoint[1] + (endY - startPoint[1]) / 2
        let rx = Math.abs((endX - startPoint[0]) / 2)
        let ry = Math.abs((endY - startPoint[1]) / 2)
        g.select('ellipse').remove();

        g.append('ellipse')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('rx', rx)
            .attr('ry', ry)
            .attr('stroke', '#53DBF3')
            .attr('fill', 'none')
            .attr('stroke-width', 6)
            .style("cursor", "pointer")
    })

    svg.on('mouseup', function(event) {
        g.remove()
        g = svg.append('g')

        let cx = startPoint[0] + (endX - startPoint[0]) / 2
        let cy = startPoint[1] + (endY - startPoint[1]) / 2
        let rx = endX ? Math.abs((endX - startPoint[0]) / 2) : 0
        let ry = endY ? Math.abs((endY - startPoint[1]) / 2) : 0
    
        if (rx > 0 && ry > 0) {

            g.append('ellipse')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('rx', rx)
                .attr('ry', ry)
                .attr('stroke', '#53DBF3')
                .attr('fill', `rgba(0,0,255, 0.05)`)
                .attr('stroke-width', 6)
                .style("cursor", "pointer")
                .on('click', function() {
                    g = d3.select(this.parentNode)
                    let rect = g.select('.select-border')

                    rect
                        .attr('stroke', '#53DBF3')
                        .attr('stroke-width', 1)

                    let circles = g.selectAll('circle').attr('fill', 'red')

                })

            let rect = g.append('rect')
                .attr('x', Math.min(startPoint[0], endX))
                .attr('y', Math.min(startPoint[1], endY))
                .attr('width', Math.abs(endX - startPoint[0]))
                .attr('height', Math.abs(endY - startPoint[1]))
                .attr('stroke', 'none')
                .attr('fill', `none`)
                .style("cursor", "pointer")
                .attr('class', 'select-border')

            let circlePoints = {
                'top-left': [startPoint[0], startPoint[1]],
                'bot-left': [startPoint[0], endY],
                'top-right': [endX, startPoint[1]],
                'bot-right': [endX, endY]

            }

            for (key of Object.keys(circlePoints)) {
                let cx = circlePoints[key][0]
                let cy = circlePoints[key][1]

                g.append('circle')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', 10)
                    .attr('fill', `none`)
                    .attr('class', key)
                    .on('mouseover', function(event) {
                        let circle = d3.select(this)
                        let targetClass = circle.attr('class')
                    
                        if (targetClass == 'top-left' || targetClass == 'bot-right') {
                            circle.style("cursor", "se-resize")
                        } else {
                            circle.style("cursor", "sw-resize")
                        }
                    })
                    .call(d3.drag()
                        .on('drag', function(event) {
                            let circle = d3.select(this)
                            let targetClass = circle.attr('class')
                            let g = d3.select(this.parentNode)
                            let sameCxCircle = g.select(`.${cornerMap[targetClass].sameCx}`)
                            let sameCyCircle = g.select(`.${cornerMap[targetClass].sameCy}`)
                            let rect = g.select('.select-border')
                            let x = event.x
                            let y = event.y
                            let ellipse = g.select('ellipse')

                            if (!oppositeCorner) {
                                oppositeCorner = cornerMap[targetClass].opposite
                                oppositeCircle = g.select(`.${oppositeCorner}`)
                                oppositeCx = oppositeCircle.attr('cx')
                                oppositeCy = oppositeCircle.attr('cy')
                            }


                            let newRx = 0
                            let newRy = 0
                            let newCx = 0
                            let newCy = 0

                            if (targetClass == 'top-left') {
                                newRx = Math.abs(oppositeCx - x)
                                newRy = Math.abs(oppositeCy - y)
                                newCx = Math.min(oppositeCx, x) + newRx / 2
                                newCy = Math.min(oppositeCy, y) + newRy / 2
                            } else if (targetClass == 'bot-right') {
                                newRx = Math.abs(oppositeCx - x)
                                newRy = Math.abs(oppositeCy - y)
                                newCx = Math.min(oppositeCx, x) + newRx / 2
                                newCy = Math.min(oppositeCy, y) + newRy / 2
                            } else if (targetClass == 'top-right') {
                                newRx = Math.abs(oppositeCx - x)
                                newRy = Math.abs(oppositeCy - y)
                                newCx = Math.min(oppositeCx, x) + newRx / 2
                                newCy = Math.min(oppositeCy, y) + newRy / 2
                            } else if (targetClass == 'bot-left') {
                                newRx = Math.abs(oppositeCx - x)
                                newRy = Math.abs(oppositeCy - y)
                                newCx = Math.min(oppositeCx, x) + newRx / 2
                                newCy = Math.min(oppositeCy, y) + newRy / 2
                            }

                            ellipse.attr('cx', newCx)
                                .attr('cy', newCy)
                                .attr('rx', newRx / 2)
                                .attr('ry', newRy / 2)

                            circle.attr('cx', x).attr('cy', y)
                            sameCxCircle.attr('cx', x)
                            sameCyCircle.attr('cy', y)

                            rect.attr('x', Math.min(oppositeCx, x)).attr('y', Math.min(oppositeCy, y)).attr('width', Math.abs(oppositeCx - x)).attr('height', Math.abs(oppositeCy - y))
                        })
                        .on('end', function(event) {
                            oppositeCorner = null
                        }))

            }

        }




        drawing = false
        startPoint.splice(0)
        endX = null, endY = null
    })

}

function drawLineBendable(svg) {

    // generate variables
    let startPoint, g, marker, transformX = 0,
        transformY = 0,
        line, x1, x2, y1, y2
    let drawing = false

    svg.on("mousedown", (event) => {

        if (event.button === 0) {
            if (drawing) return

            if (!drawing) {
                startPoint = d3.pointer(event)
                x1 = startPoint[0]
                y1 = startPoint[1]
                g = svg.append("g").attr("class", "draw-line")
                drawing = true
            }
        }
    })

    svg.on("mousemove", (event) => {
        if (!drawing) return // if the drawing is false, do nothing

        let [x2, y2] = d3.pointer(event)

        if (!marker) {
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

        line = g.select("line")

        if (line.empty()) {
            g.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr('stroke', "#53DBF3")
                .attr('stroke-width', 6)
                .attr("marker-end", "url(#triangle)");
        } else {
            line
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
        }

    })

    // event listeners on the svg
    svg.on("mouseup", (event) => {

        // check if the left mouse button is clicked
        if (event.button === 0) {
            // if the drawing is true, then we are in the middle of drawing a line, so we need to end the drawing
            if (drawing) {
                // remove the g element that contains the line of status drawing
                svg.select("g.draw-line").remove()

                // get the x and y coordinates of the mouse pointer
                [x2, y2] = d3.pointer(event)

                // create the line
                g = svg.append("g")
                line = g.append("line")
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)
                    .attr('stroke', '#53DBF3')
                    .attr('stroke-width', 6)
                    .attr("marker-end", "url(#triangle)")
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended)
                    )

                let cx = Math.min(x1, x2) + Math.abs((x1 - x2)) / 2
                let cy = Math.min(y1, y2) + Math.abs((y1 - y2)) / 2
           

                let modificationButton = g.append("circle")
                    .attr('cy', `${cy}px`)
                    .attr('cx', `${cx}px`)
                    .attr('r', 20)
                    .style('fill', 'rgba(255,0,0,0.005)')
                    .style("cursor", "pointer")
                    .on("mouseover", (event) => {
                  
                        let button = d3.select(event.target)
                        button.style("fill", "red")
                    })
                    .on("mouseout", (event) => {
                        let button = d3.select(event.target)
                            .style('fill', 'rgba(255,0,0,0.005)')
                    })
                    .call(d3.drag()
                        .on("start", curveLine)
                        .on("drag", curveLine))

                // set variables to default
                drawing = false


                return
            }

            // if the drawing is false, then we are not in the middle of drawing a line, so we need to start drawing
            if (!drawing) {
                startPoint = d3.pointer(event)
                g = svg.append("g").attr("class", "draw-line")
                drawing = true
            }

        }
    })

    // event listener for the mouse move when user moves the mouse to stretch the line
    svg.on("mousemove", (event) => {
        if (!drawing) return // if the drawing is false, do nothing

        [x2, y2] = d3.pointer(event)

        if (!marker) {
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
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr('stroke', "#53DBF3")
            .attr('stroke-width', 6)
            .attr("marker-end", "url(#triangle)");

    })

    function dragstarted(event) {


        let transform = d3.select(this).attr("transform")
        if (transform) {
            let translate = transform.split("(")[1].split(")")[0].split(",")
            transformX = parseFloat(translate[0])
            transformY = parseFloat(translate[1])
        }
    }

    function dragged(event) {
        transformX += event.dx
        transformY += event.dy
        d3.select(this.parentNode).select("line").attr("transform", `translate(${transformX}, ${transformY})`)
    }

    function dragended(event) {

    }

    function curveLine(event) {
        let bendableLine, circleTransformX, circleTransformY
        let circle = d3.select(this)
        let g = d3.select(this.parentNode)
        let parentLine = g.select('line')
        const curve = d3.line().curve(d3.curveCardinal);


        if (!parentLine.empty()) {
            x1 = parentLine.attr('x1');
            x2 = parentLine.attr('x2');
            y1 = parentLine.attr('y1');
            y2 = parentLine.attr('y2');

            let [x3, y3] = d3.pointer(event)
            parentLine.remove()
            let points = [
                [x1, y1],
                [x3, y3],
                [x2, y2]
            ]
            bendableLine = g.append('path').attr('d', curve(points)).attr('stroke', '#53DBF3').attr('fill', 'none').attr('stroke-width', 3).attr("marker-end", "url(#triangle)");

        } else {
            bendableLine = g.select('path')


            let pointsText = bendableLine.attr('d')
            let {
                startPoint,
                endPoint
            } = extractStartAndEndPointFromCurveLine(pointsText)
            let middlePoint = [event.x, event.y]
            let points = [startPoint, middlePoint, endPoint]

            bendableLine
                .attr('d', curve(points))



            circle
                .attr('cx', event.x)
                .attr('cy', event.y)


        }
    }
}