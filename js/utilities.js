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

function printToFile(divId, downloadButtonId) {

    var div = document.getElementById(divId);

    html2canvas(div, {
        onrendered: function (canvas) {
            var imageData = canvas.toDataURL("image/jpg");
            //create your own dialog with warning before saving file
            //beforeDownloadReadMessage();
            //Then download file
            var newData = imageData.replace(/^data:image\/jpg/, "data:application/octet-stream");
            d3.select("#" + downloadButtonId).attr("download","image.jpg").attr("href", newData);
        }
    });
}