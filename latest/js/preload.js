"use strict";

var targetObject = undefined;
var handlingInput = false;
var clickCounter = 0;
var clickTime = undefined;
var welcomed = false;
var hmdReady = false;
var currentMode = "AR";
var osBrowserInfo = "none";
var nextAction = 0;
var sectionScripts = [
    sectionOne,
    sectionTwo,
    sectionThree
]

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

AFRAME.registerComponent('cursor-listener', {
    init: function () {

        if( this.el.id === "introEarth" ) {
            this.el.addEventListener('click', function (evt) {
            if ( !welcomed && hmdReady ) {
                console.log("Fused on",this.id);
                let welcomesound = document.getElementById("welcome");
                welcomesound.play();
                welcomed = true;
            }
            },true);
        } else {
            this.el.addEventListener('click', function (evt) {
            if (currentMode !== "AR") {
                console.log("Clicked on",this.id);
            }
            },true);
        }

        this.el.addEventListener('fusing', function (evt) {
            if (currentMode !== "AR") {
            console.log("Fusing on",this.id);
            }
        },true);

        this.el.addEventListener('mouseenter', function (evt) {
            if (currentMode !== "AR") {
            console.log("Cursor on",this.id);
            }
        },true);

        this.el.addEventListener('mouseleave', function (evt) {
            if (currentMode !== "AR") {
            console.log("Cursor off",this.id);
            }
        },true);

        this.el.addEventListener('raycaster-intersected', function(evt) {
            if (currentMode !== "AR") {
            console.log("Intersected", this.id);
            targetObject = this.id;
            this.setAttribute('material', 'emissiveIntensity', '1');
            }
        },true);

        this.el.addEventListener('raycaster-intersected-cleared', function(evt) {
            if (currentMode !== "AR") {
            console.log("Cleared", this.id);
            targetObject = undefined;
            this.setAttribute('material', 'emissiveIntensity', '0');
            }
        },true);

        if( this.el.id === "introEarth" ) {
            this.el.addEventListener('cardboardbutton', function () {
                if ( hmdReady && ( currentMode !== "AR" ) ) {
                    let openingsound = document.getElementById("openingaudio");
                    openingsound.play();
                    let sphere = document.getElementById("introEarth");
                    sphere.emit('startshrink');
                    let pictureSphere = document.getElementById("picturesphere");
                    pictureSphere.emit('startexpand');
                    document.getElementById("classroom").setAttribute("visible","true");
                }
            },true);
        } else {
            this.el.addEventListener('cardboardbutton', function (evt) {
                if ( currentMode !== "AR" ) {
                console.log("Cardboard button on",this.id);
                }
            },true);
        }
    }
});

function sectionOne() {
    let clickPrompt = document.getElementById("clickPrompt");
    clickPrompt.setAttribute("visible","false");
    let classroomintroaudio = document.getElementById("classroomintroaudio");
    classroomintroaudio.play();
}

function sectionTwo() {
    let clickPrompt = document.getElementById("clickPrompt");
    clickPrompt.setAttribute("visible","false");
    let studentinfoaudio = document.getElementById("studentinfoaudio");
    studentinfoaudio.play();
    setTimeout(studentinfoshowmenu, 3000);
}

function sectionThree() {

}

function studentinfoshowmenu() {
    document.getElementById("studentmenutop").setAttribute("visible","true");
    setTimeout(studentinfoshowinstitutionmenu, 3000);
}

function studentinfoshowinstitutionmenu() {
    document.getElementById("studentinstitutionmenu").setAttribute("visible","true");
    setTimeout(studentinfoshowprofile, 3000);
}

function studentinfoshowprofile() {
    document.getElementById("studentinstitutionprofile").setAttribute("visible","true");
    setTimeout(studentinfohideinstitutionmenu, 3000);
}

function studentinfohideinstitutionmenu() {
    document.getElementById("studentinstitutionmenu").setAttribute("visible","false");
    document.getElementById("studentinstitutionprofile").setAttribute("visible","false");
    setTimeout(studentinfoshowclassmenu, 3000);
}

function studentinfoshowclassmenu() {
    document.getElementById("studentclassmenu").setAttribute("visible","true");
    setTimeout(studentinfoshowattendanceprofile, 3000);
}

function studentinfoshowattendanceprofile() {
    document.getElementById("studentclassattendance").setAttribute("visible","true");
    setTimeout(studentinfohideattendanceprofile, 3000);
}

function studentinfohideattendanceprofile() {
    document.getElementById("studentclassattendance").setAttribute("visible","false");
    setTimeout(studentinfoshowengagementprofile, 3000);
}

function studentinfoshowengagementprofile() {
    document.getElementById("studentclassengagement").setAttribute("visible","true");
    setTimeout(studentinfohideclassmenu, 3000);
}

function studentinfohideclassmenu() {
    document.getElementById("studentmenutop").setAttribute("visible","false");
    document.getElementById("studentclassmenu").setAttribute("visible","false");
    document.getElementById("studentclassengagement").setAttribute("visible","false");
}