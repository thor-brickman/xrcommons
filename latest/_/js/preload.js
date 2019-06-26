"use strict";

// Various and sundry global variables...
let targetObject = undefined;
let handlingInput = false;
let clickCounter = 0;
let clickTime = undefined;
let welcomed = false;
let hmdReady = false;
let currentMode = "AR";
let osBrowserInfo = "none";
let nextAction = 0;

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
                targetObject = this.id;
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
            }
        },true);

        this.el.addEventListener('raycaster-intersected-cleared', function(evt) {
            if (currentMode !== "AR") {
                console.log("Cleared", this.id);
                targetObject = undefined;
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