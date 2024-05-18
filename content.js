
chrome.runtime.onMessage.addListener((request) => {

    let removeButton, drawFunction
    // window.alert(request.screenShotUrl)
    const screenShotUrl = request.screenShotUrl

    // check if board is already created
    let isBoardCreated = d3.select("#zen-board").empty()

    if(!isBoardCreated){
        window.alert("Screenshot already created")
    }else{

        // create board and append screenshot
        const board = d3.select("body").append("div")
        .attr("id", "zen-board")

        // create screenshot container
        const screenShotContainer = board.append("div")
        .attr("id", "screenshot-container")

        // create svg container
        const screenShotSvg = screenShotContainer.append("svg")
        .attr("id", "screenshot-svg")
        .attr("width", screenShotContainer.style("width"))
        .attr("height", screenShotContainer.style("height"))


        // append screenshot to svg
        const defs = screenShotSvg.append("defs")

        defs.append("pattern")
        .attr("id", "backgroundPattern")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("image")
        .attr("xlink:href", screenShotUrl)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("patternContentUnits", "objectBoundingBox") 
        .attr("width", screenShotSvg.attr("width"))
        .attr("height", screenShotSvg.attr("height"));

        // add rect element to create 
        screenShotSvg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "url(#backgroundPattern)");
        
        // add remove element button
        // screenShotSvg.on("contextmenu", () => {
        //     event.preventDefault()
        //     const [x, y] = d3.pointer(event)

        //     if(event.target.id === "screenshot-svg") return

        //     if(removeButton){
        //         removeButton.remove()
        //     }

        //     removeButton = createRemoveButton(event.target, x, y, removeButton, board.attr("id"))
        // })

        // add close button
        const closeButton = board.append("button").text("Close").on("click", () => {
            board.remove()
        })

        // create menu
        const menu = board.append("div").attr("id", "menu")

        const menuItemMap = {
            "circle": drawCircle,
            "polygon": drawPolygon,
            "line": drawLine,
            "selection": drawSelection,
            "curve": drawCurveNatural,
            "rectangle": drawRectangle,
            "draw": drawFreeHand,
            "ellipseArea": drawEllipseArea,
            "drawlineBendable": drawLineBendable
        }

        Object.keys(menuItemMap).forEach((item) => {

            const buttonName = item.toUpperCase()
            const buttonId = `zen-${item}-button`
            const className = "menu-item"

            menu.append("button")
            .text(buttonName)
            .attr("id", buttonId)
            .attr("class", className)
            .on("click", () => {
                screenShotSvg.on("mouseup", null)
                screenShotSvg.on("mousedown", null)
                screenShotSvg.on("click", null)   // remove previous event listener
                drawFunction = menuItemMap[item]  
                drawFunction(screenShotSvg)    
            })
        })

        //create download button
        const downloadButton = board.append("button").attr("id","zen-download-button").text("Download").on("click", () => {
            const svg = document.getElementById("screenshot-svg")
    
            const serializer = new XMLSerializer();
            const source = serializer.serializeToString(svg);
            const canvas = document.createElement('canvas');

            canvas.width = svg.width.baseVal.value //
            canvas.height = svg.height.baseVal.value

            const ctx = canvas.getContext('2d');
            const domURL = window.URL || window.webkitURL || window;
            const img = new Image();
            const svgBlob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
            const url = domURL.createObjectURL(svgBlob);
            img.onload = function () {
                ctx.drawImage(img, 0, 0);
                const imgURI = canvas.toDataURL('image/png')
                const a = document.createElement('a');
                a.href = imgURI;
                a.download = 'screenshot.png';
                a.click();
            };
            img.src = url;                 

        })
    }
})