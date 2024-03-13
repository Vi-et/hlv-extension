chrome.runtime.onMessage.addListener((request) => {

    let removeButton, drawing, drawFunction
    // window.alert(request.screenShotUrl)
    const screenShotUrl = request.screenShotUrl

    // check if board is already created
    let isBoardCreated = d3.select("#zen-board").empty()

    if(!isBoardCreated){
        window.alert("Screenshot already created")
    }else{

        // create board and append screenshot
        board = d3.select("body").append("div")
        .attr("id", "zen-board")

        // create screenshot container
        const   screenShotContainer = board.append("div")
        .attr("id", "screenshot-container")

        // append screenshot
        const screenShot = screenShotContainer.append("img")
        .attr("src", screenShotUrl)
        .attr("id", "screenshot")

        // create svg container
        const screenShotSvg = screenShotContainer.append("svg")
        .attr("id", "screenshot-svg")

        // add remove element button
        screenShotSvg.on("contextmenu", () => {
            event.preventDefault()
            const {x, y} = d3.pointer(event)

            if(removeButton){
                removeButton.remove()
            }

            removeButton = createRemoveButton(event.target, x, y, removeButton, board.attr("id"))
        })

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
            printToFile("screenshot-container", "zen-download-button")
        })




        


    
    }
})