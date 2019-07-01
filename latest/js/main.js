"use strict";

// Grab the current gaze direction 10 times a second.
function recordHMD() {
    if( currentMode !== "AR" ) {
        let d = new Date();
        let rightNow = d.getTime();
        let mainCamera = document.getElementById("camera");
        let HMDposition = mainCamera.getAttribute("position");
        let HMDrotation = mainCamera.getAttribute("rotation");
        let logObject = {};
        logObject.timeStamp = rightNow;
        logObject.type = "HMD";
        logObject.position = HMDposition;
        logObject.rotation = HMDrotation;
        gazeX.push(-HMDrotation.y);
        gazeY.push(HMDrotation.x)
        activityLog[rightNow] = logObject;
        if( trackingCursor ) {
            const sceneEL = document.getElementById("mainScene");
            const newEntityEL = document.createElement('a-entity');

            newEntityEL.setAttribute('geometry',"primitive: ring; radiusInner: 0.02; radiusOuter: 0.03");
            newEntityEL.setAttribute('material',"color: #8F8; shader: flat; transparent: true; opacity: 0.5;");
            let cursorEL = document.getElementById("mainCursor");
            cursorEL.object3D.getWorldPosition(newEntityEL.object3D.position);
            cursorEL.object3D.getWorldQuaternion(newEntityEL.object3D.quaternion);
            newEntityEL.setAttribute('animation__fadeaway', "property: scale; easing: linear; loop: false; dur: 4000; from: 1 1 1; to: 0 0 0");

            newEntityEL.addEventListener( "animationcomplete__fadeaway", function() {
                this.parentNode.removeChild(this);
            }, false );

            sceneEL.appendChild(newEntityEL);
        }
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
    sectionOne,
    sectionTwo,
    sectionThree,
    sectionFour,
    sectionFive
]

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
    this.emit('startshrink');
}, false );

document.getElementById("classroom").addEventListener( "animationcomplete__slidein", function() {
    currentMode = "waiting";
    document.getElementById("clickPrompt").setAttribute("visible","true");
}, false );

document.getElementById("classroomintroaudio").addEventListener( "ended", function() {
    document.getElementById("student1").setAttribute("visible","true");
    document.getElementById("student1").setAttribute("data-clickable","true");

    document.getElementById("student2").setAttribute("visible","true");
    document.getElementById("student2").setAttribute("data-clickable","true");

    currentMode = "waiting";
    document.getElementById("clickPrompt").setAttribute("visible","true");
    nextAction = 1;
});

document.getElementById("studentinfoaudio").addEventListener( "ended", function() {
    currentMode = "waiting";
    studentinfohideclassmenu();
    document.getElementById("clickPrompt").setAttribute("visible","true");
    nextAction = 2;
});

document.getElementById("experienceintroaudio").addEventListener( "ended", function() {
    currentMode = "waiting";
    document.getElementById("clickPrompt").setAttribute("visible","true");
    nextAction = 3;
});

document.getElementById("biomechanicalintroaudio").addEventListener( "ended", function() {
    studentinfohideclassmenu();
    trackingCursor = false;
    moveToAnalytics();
});

// PictureSphere animation listeners
document.getElementById("picturesphere").addEventListener( "animationcomplete__shrink", function() {
    console.log("Shrink finished...sliding in classroom...");
    let introEarth = document.getElementById("introEarth");
    introEarth.parentNode.removeChild(introEarth);
    document.getElementById("classroom").setAttribute("visible", "true");
    document.getElementById("ganesh").setAttribute("data-clickable","true");
    document.getElementById("ka").setAttribute("data-clickable","true");
    document.getElementById("standingwoman").setAttribute("data-clickable","true");
    document.getElementById("ambientlight").setAttribute("light", "intensity", 0.8);
    document.getElementById("directionallight").setAttribute("light", "intensity", 0.5);
    document.getElementById("directionallight").setAttribute("position","-10 20 -10")
    console.log("Lowered the ambient light...");
    document.getElementById("classroom").emit('startslidein');
}, false );

document.getElementById("classroom").addEventListener( "animationcomplete__slideout", function() {
    console.log("Animationfinished, hiding classroom.");
    this.setAttribute("visible","false");
    console.log("Bringing in Mesaverde.");
    let mesaverde = document.getElementById("mesaverde");
    mesaverde.setAttribute("visible","true");
    mesaverde.emit("startslidein");
    console.log("Cleaning up classroom.");
    this.parentNode.removeChild(this);
}, false );

document.getElementById("mesaverde").addEventListener( "animationcomplete__slidein", function() {
    console.log("mesaverde in, moving students.");

    let directionallight = document.getElementById("directionallight");
    directionallight.setAttribute("position","15 20 0")

    let student1standing = document.getElementById("student1standing");
    let student1 = document.getElementById("student1");
    student1.setAttribute("visible","false");
    student1.parentNode.removeChild(student1);
    student1standing.setAttribute("visible","true");
    student1standing.setAttribute("data-clickable","true");

    let student2standing = document.getElementById("student2standing");
    let student2 = document.getElementById("student2");
    student2.setAttribute("visible","false");
    student2.parentNode.removeChild(student2);
    student2standing.setAttribute("visible","true");
    student2standing.setAttribute("data-clickable","true");

}, false );

document.getElementById("mesaverde").addEventListener( "animationcomplete__slideout", function() {
    console.log("mesaverde out, removing students.");

    this.setAttribute("visible","false");

    let student1standing = document.getElementById("student1standing");
    let student1hilite = document.getElementById("student1hilite");
    let student1shadow = document.getElementById("student1shadow");

    student1hilite.setAttribute("visible","false");
    student1hilite.parentNode.removeChild(student1hilite);
    student1standing.setAttribute("visible","false");
    student1standing.parentNode.removeChild(student1standing);
    student1shadow.setAttribute("visible","false");
    student1shadow.parentNode.removeChild(student1shadow);

    let student2standing = document.getElementById("student2standing");
    let student2hilite = document.getElementById("student2hilite");
    let student2shadow = document.getElementById("student2shadow");

    student2hilite.setAttribute("visible","false");
    student2hilite.parentNode.removeChild(student2hilite);
    student2standing.setAttribute("visible","false");
    student2standing.parentNode.removeChild(student2standing);
    student2shadow.setAttribute("visible","false");
    student2shadow.parentNode.removeChild(student2shadow);

    document.getElementById("dataDisplay").setAttribute("visible","true");
    plotEyeMovements();

}, false );

document.getElementById("dataDisplay").addEventListener( "animationcomplete__scaleup", function() {
    currentMode = "waiting";
    document.getElementById("clickPrompt").setAttribute("visible","true");
    nextAction = 4;
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

if( osBrowserInfo === "Android-Chrome" ) {
    console.log("Adjusting camera rotation for Chrome on Android");
    document.getElementById("camerarig").setAttribute("rotation","0 180 0");
} else {
    console.log("osBrowserInfo: ", osBrowserInfo)
}

// These are called by the click to continue prompt in order to satisfy iPhone security needs...
function sectionOne() {
    document.getElementById("clickPrompt").setAttribute("visible","false");
    document.getElementById("classroomintroaudio").play();
}

function sectionTwo() {
    document.getElementById("clickPrompt").setAttribute("visible","false");
    document.getElementById("studentinfoaudio").play();
    setTimeout(studentinfoshowmenu, 3000);
}

function sectionThree() {
    document.getElementById("clickPrompt").setAttribute("visible","false");
    document.getElementById("experienceintroaudio").play();
    moveToExperience();
}

function sectionFour() {
    document.getElementById("clickPrompt").setAttribute("visible","false");
    document.getElementById("biomechanicalintroaudio").play();
    trackingCursor = true;
}

function sectionFive() {
    document.getElementById("clickPrompt").setAttribute("visible","false");
}

// Various menu operations...
function studentinfoshowmenu() {
    document.getElementById("studentmenutop").setAttribute("visible","true");
    document.getElementById("studentmenutop").setAttribute("data-clickable","true");

    setTimeout(studentinfoshowinstitutionmenu, 3000);
}

function studentinfoshowinstitutionmenu() {
    document.getElementById("studentinstitutionmenu").setAttribute("visible","true");
    document.getElementById("studentinstitutionmenu").setAttribute("data-clickable","true");

    document.getElementById("studentmenutop").setAttribute("material","src","images/studentmenudisabled.png");

    setTimeout(studentinfoshowprofile, 3000);
}

function studentinfoshowprofile() {
    document.getElementById("studentinstitutionprofile").setAttribute("visible","true");
    document.getElementById("studentinstitutionprofile").setAttribute("data-clickable","true");

    setTimeout(studentinfohideinstitutionmenu, 3000);
}

function studentinfohideinstitutionmenu() {
    document.getElementById("studentinstitutionmenu").setAttribute("visible","false");
    document.getElementById("studentinstitutionmenu").removeAttribute("data-clickable");

    document.getElementById("studentinstitutionprofile").setAttribute("visible","false");
    document.getElementById("studentinstitutionprofile").removeAttribute("data-clickable");

    document.getElementById("studentmenutop").setAttribute("material","src","images/studentmenu.png");

    setTimeout(studentinfoshowclassmenu, 3000);
}

function studentinfoshowclassmenu() {
    document.getElementById("studentclassmenu").setAttribute("visible","true");
    document.getElementById("studentclassmenu").setAttribute("data-clickable","true");

    document.getElementById("studentmenutop").setAttribute("material","src","images/studentmenudisabled.png");

    setTimeout(studentinfoshowattendanceprofile, 3000);
}

function studentinfoshowattendanceprofile() {
    document.getElementById("studentclassattendance").setAttribute("visible","true");
    document.getElementById("studentclassattendance").setAttribute("data-clickable","true");

    setTimeout(studentinfohideattendanceprofile, 3000);
}

function studentinfohideattendanceprofile() {
    document.getElementById("studentclassattendance").setAttribute("visible","false");
    document.getElementById("studentclassattendance").removeAttribute("data-clickable");

    setTimeout(studentinfoshowengagementprofile, 1500);
}

function studentinfoshowengagementprofile() {
    document.getElementById("studentclassengagement").setAttribute("visible","true");
    document.getElementById("studentclassengagement").setAttribute("data-clickable","true");
}

function studentinfohideclassmenu() {
    document.getElementById("studentmenutop").setAttribute("visible","false");
    document.getElementById("studentmenutop").removeAttribute("data-clickable");
    document.getElementById("studentclassmenu").setAttribute("visible","false");
    document.getElementById("studentclassmenu").removeAttribute("data-clickable");
    document.getElementById("studentclassengagement").setAttribute("visible","false");
    document.getElementById("studentclassengagement").removeAttribute("data-clickable");
}

function moveToExperience() {
    document.getElementById("classroom").emit('startslideout');
}

function moveToAnalytics() {
    document.getElementById("mesaverde").emit('startslideout');
}

function plotEyeMovements() {
    console.log("Plotting Graph");

    let d3 = Plotly.d3;
    // let img_jpg = d3.select('#jpg-export');
    let imgjpg = document.getElementById("plotlyimage");

    // Plotting the Graph
    console.log("Plotting Graph");
    console.log(imgjpg);
    let trace = {
        x:gazeX,
        y:gazeY,
        type:'scatter'};
    let data = [trace];
    let layout = {title : "Eye movement scatter plot"};
    Plotly.plot(
    'plotlydiv',
    data,
    layout).then(
        function(gd)
        {
            console.log("Ran the plot...now doing toImage");
            Plotly.toImage(gd,{height:512,width:512}).then(
                function(url)
                {
                    imgjpg.setAttribute("src", url);
                    return Plotly.toImage(gd,{format:'jpeg',height:512,width:512});
                }
            )
        });
    
    document.getElementById("dataDisplay").setAttribute("src","#plotlyimage");
    currentMode = "waiting";
    document.getElementById("clickPrompt").setAttribute("visible","true");
    nextAction = 4;
}