"use strict";

// Grab the current gaze direction 10 times a second.
function recordHMD() {
    if( currentMode !== "AR" ) {
        let mainCamera = document.getElementById("camera");
        let HMDposition = mainCamera.getAttribute("position");
        let HMDrotation = mainCamera.getAttribute("rotation");
        let logObject = {};
        let d = new Date();
        let rightNow = d.getTime();
        logObject.timeStamp = rightNow;
        logObject.type = "HMD";
        logObject.position = HMDposition;
        logObject.rotation = HMDrotation;
        if( targetObject !== undefined ) {
            logObject.target = targetObject;
            if( targetCounts[targetObject.id] !== undefined ) {
                targetCounts[targetObject.id]++;
            } else {
                targetCounts[targetObject.id] = 1;
            }
        }
        gazeX.push(-HMDrotation.y);
        gazeY.push(HMDrotation.x)
        activityLog[rightNow] = logObject;
    }
}

function recordRaycaster( activity, target ) {
    if( currentMode !== "AR" ) {
        let d = new Date();
        let rightNow = d.getTime();
        let logObject = {};
        logObject.timeStamp = rightNow;
        logObject.type = "Int";
        logObject.activity = activity;
        logObject.target = target;
        activityLog[rightNow] = logObject;
        console.log(activityLog[rightNow]);
    }
}

setInterval(recordHMD, 100);

// Array of function targets for the "click to continue" prompts...
let sectionScripts = [
    sectionOne
];

// Get access to the camera!

document.querySelector('a-scene').addEventListener('loaded', function () {

    let splashScreen = document.getElementById("splashScreen");
    splashScreen.addEventListener( 'click', function( eventData ) {
        const silence = document.getElementById('silenceAudio');
        silence.play();
        let constraints = {
        video: { facingMode: "environment" }
        };
        console.log(constraints);
        let video = document.getElementById('cameraFeed');
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            //video.src = window.URL.createObjectURL(stream);
            video.srcObject = stream;
            video.play();
            currentMode = "AR";
            let splashScreenEL = document.getElementById('splashScreen');
            splashScreenEL.style.display = "none";
        });
    });

});

window.addEventListener('touchstart', function () {

    let doubleclickflag = false;
    console.log("Ok...we got a touch");

    if( currentMode === "waiting" ) {
        currentMode = "playing";
        sectionScripts[nextAction]();
        return;
    }

    // Check for double click
    let d = new Date();
    let rightNow = d.getTime();
    if ( clickTime !== undefined ) {
        if ( rightNow - clickTime > 300 ) {
            clickCounter = 0;
        }
    }
    clickTime = rightNow;
    clickCounter = clickCounter + 1;
    if ( clickCounter === 2 ) {
        clickCounter = 0;
        doubleclickflag = true;
    }

    if ( ( targetObject !== undefined ) && !doubleclickflag ) {
        let clickTarget = document.getElementById(targetObject);
        clickTarget.emit('cardboardbutton');
    }

    if ( doubleclickflag ) {
        if ( !hmdReady && ( currentMode === "AR" ) ) {
            console.log("hmdReady");
            hmdReady = true;
            document.getElementById("openingScenePivot").center;
            document.getElementById("openingScenePivot").setAttribute("visible","true");
            document.getElementById('arScreen').setAttribute("visible","false");
            document.getElementById('cameraFeed').pause();
            document.getElementById('mainCursor').setAttribute('visible',"true");
            currentMode = "playing";
            if ( !welcomed ) {
                console.log("Fused on",this.id);
                let welcomesound = document.getElementById("welcome");
                welcomesound.play();
                welcomed = true;
            }
        }
    }
} , false);

// Let's also emulate the touch event with a keyboard press
document.addEventListener("keydown", event => {
    if ( event.isComposing || event.keyCode === 229 ) {
        return;
    }
    // Look for a space
    if ( event.keyCode === 32 ) {
        window.dispatchEvent( new Event('touchstart') );
    }
});

document.getElementById("picturesphere").addEventListener( "animationcomplete__expand", function() {
    // this.emit('startshrink');
    console.log("Expanded, starting fade...");
    document.getElementById("ambientlight").emit("startfadeout");
    document.getElementById("directionallight").emit("startfadeout");
}, false );

document.getElementById("ambientlight").addEventListener( "animationcomplete__fadeout", function() {
    console.log("Fade Out complete...");
    let openingScene = document.getElementById("openingScenePivot");
    openingScene.parentNode.removeChild(openingScene);
    document.getElementById("portalRoom").setAttribute("visible","true");
    // document.getElementById("ambientlight").emit("startfadein");
}, false );

// We need ammo to handle browser and OS idiosyncracies...sheesh...
function getPlatformUserAgentInfo() {
    let userAgent = window.navigator.userAgent;
    let platform = window.navigator.platform;
    let os = null;
    let browser = null;

    console.log("userAgent: ", userAgent);
    console.log("platform: ", platform);

    if (/Mac/.test(platform)) {
        os = 'Mac';
    } else if (/Win/.test(platform)) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    }
    
    if (/CriOS/.test(userAgent)) {
        browser = 'Chrome';
    } else if (/iPhone/.test(userAgent)) {
        browser = 'Safari';
    } else if (/Chrome/.test(userAgent)) {
        browser = 'Chrome';
    }

    return os + '-' + browser;

}
osBrowserInfo = getPlatformUserAgentInfo();
console.log(osBrowserInfo);

// These are called by the click to continue prompt in order to satisfy iPhone security needs...
function sectionOne() {
    document.getElementById("clickPrompt").setAttribute("visible","false");
}

// function plotEyeMovements() {
//     console.log("Plotting Graph");

//     let d3 = Plotly.d3;
//     let imgjpg = d3.select('#dataDisplay');

//     // Plotting the Graph
//     console.log("Plotting Graph");
//     console.log(imgjpg);
//     let trace = {
//         x:gazeX,
//         y:gazeY,
//         type:'scatter'};
//     let data = [trace];
//     let layout = {title : "Eye movement scatter plot"};
//     Plotly.plot('plotlydiv',data,layout).then(
//         function(gd) {
//             console.log("Ran the plot...now doing toImage");
//             Plotly.toImage(gd,{height:512,width:512}).then(
//                 function(url) {
//                     imgjpg.attr("src", url);
//                     return Plotly.toImage(gd,{format:'jpeg',height:512,width:512});
//                 }
//             )
//         }
//     );
    
//     document.getElementById("dataDisplay").setAttribute("visible","true");
//     currentMode = "waiting";
//     document.getElementById("clickPrompt").setAttribute("visible","true");
//     nextAction = 4;
// }