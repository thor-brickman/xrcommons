"use strict";

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
            let screen = document.getElementById('arScreen');
            screen.setAttribute("visible","false");
            let video = document.getElementById('cameraFeed');
            video.pause();
            let cursor = document.getElementById('mainCursor');
            cursor.setAttribute('visible',"true");
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
    this.emit('startshrink');
    document.getElementById("classroom").emit('slidein');
    document.getElementById("classroom").setAttribute("visible", "true");

}, false );

document.getElementById("classroom").addEventListener( "animationcomplete__slidein", function() {
    let classroomintrosound = document.getElementById("classroomintroaudio");
    currentMode = "waiting";
    document.getElementById("clickPrompt").setAttribute("visible","true");
}, false );

document.getElementById("classroomintroaudio").addEventListener( "ended", function() {
    document.getElementById("student1").setAttribute("visible","true");
    document.getElementById("student2").setAttribute("visible","true");
    currentMode = "waiting";
    document.getElementById("clickPrompt").setAttribute("visible","true");
    nextAction = 1;
});

document.getElementById("studentinfoaudio").addEventListener( "ended", function() {
    currentMode = "waiting";
    document.getElementById("clickPrompt").setAttribute("visible","true");
    nextAction = 2;
});

// PictureSphere animation listeners
document.getElementById("picturesphere").addEventListener( "animationcomplete__shrink", function() {
    console.log("Shrink finished...sliding in classroom...");
    document.getElementById("introEarth").setAttribute("visible","false");
    console.log("Hid the sphere...");
    document.getElementById("introEarth").classList.remove('clickable');
    console.log("Made it unclickable...");
    document.getElementById("ambientlight").setAttribute("light", "intensity", 0.8);
    document.getElementById("directionallight").setAttribute("light", "intensity", 0.5);
    document.getElementById("directionallight").setAttribute("position","-10 20 -10")
    console.log("Lowered the ambient light...");
}, false );

if( osBrowserInfo === "Android-Chrome" ) {
    console.log("Adjusting camera rotation for Chrome on Android");
    document.getElementById("camerarig").setAttribute("rotation","0 180 0");
} else {
    console.log("osBrowserInfo: ", osBrowserInfo)
}