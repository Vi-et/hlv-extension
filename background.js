chrome.runtime.onInstalled.addListener( function() {
    
    console.log('app installed')

    chrome.action.onClicked.addListener( function() {

        console.log("button clicked")
        chrome.tabs.captureVisibleTab( function(screenshotUrl) {
        
            console.log("screenshot taken")

            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                
                console.log("sending message")

                const activeTab = tabs[0];

                await chrome.scripting.executeScript({
                    target: {tabId: activeTab.id},
                    files: ['js/d3.v7.js', 'js/d3Utilities.js', 'js/utilities.js','js/html2canvas.js']
                })
                
                chrome.tabs.sendMessage(activeTab.id, {"screenShotUrl": screenshotUrl});

                console.log("message sent")
            })
        })
    })
})