function updateDrawingState(object, drawingState){

    Object.keys(object).forEach((key) => {
        object[key] = false
    })
    object[drawingState] = true

    return object
}

function convertPolygonPointsTextToArray(pointsText){
    let points = pointsText.split(",")
    
    let newPoints = []

    for(let i = 0; i < points.length; i += 2){
       
        newPoints.push([parseFloat(points[i]), parseFloat(points[i + 1])])
    }
    return newPoints
}

function extractStartAndEndPointFromCurveLine(d) {
    // Split the path data into commands
    const commands = d.split(/(?=[MLC])/);
    
    // Extract the start point from the first command (assuming it starts with M)
    const startPoint = commands[0].slice(1).split(',').map(Number);

    // Initialize endPoint array
    let endPoint = [];

    // Check the last command to determine the type and extract accordingly
    const lastCommand = commands[commands.length - 1];
    const commandType = lastCommand[0];
    const points = lastCommand.slice(1).split(',');

    switch (commandType) {
        case 'L':
            // If the last command is L, the end point is directly the coordinates after L
            endPoint = points.map(Number);
            break;
        case 'C':
            // If the last command is C, the end point is the last pair of coordinates
            endPoint = points.slice(-2).map(Number);
            break;
        default:
            // If another command ends the path, handle accordingly or return undefined
            console.log("Unhandled command type for end point extraction.");
            break;
    }

    return {
        startPoint: startPoint,
        endPoint: endPoint
    };
}

function getTransformValues(element){
    let transform = element.getAttribute('transform')
    let values = transform.split("(")[1].split(")")[0].split(",")
    let translateX = parseFloat(values[0])
    let translateY = parseFloat(values[1])
    return [translateX, translateY]
}