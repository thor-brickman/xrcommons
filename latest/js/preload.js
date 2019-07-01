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
let activityLog = {};
let gazeX = [];
let gazeY = [];
let trackingCursor = false;

AFRAME.registerComponent('cursor-listener', {
    init: function () {

        if( this.el.id === "introEarth" ) {
            this.el.addEventListener('click', function (evt) {
                if ( !welcomed && hmdReady ) {
                    recordRaycaster("Fused on",this.id);
                    let welcomesound = document.getElementById("welcome");
                    welcomesound.play();
                    welcomed = true;
                } else {
                    recordRaycaster("Fused",this.id);
                    targetObject = this.id;
                }
            },true);

        } else {
            this.el.addEventListener('click', function (evt) {
            if (currentMode !== "AR") {
                recordRaycaster( "Clicked", this.id );
                targetObject = this.id;
            }
            },true);
        }

        this.el.addEventListener('fusing', function (evt) {
            if (currentMode !== "AR") {
                targetObject = this.id;
                recordRaycaster("Fusing",this.id);
            }
        },true);

        this.el.addEventListener('mouseenter', function (evt) {
            if (currentMode !== "AR") {
                targetObject = this.id;
            }
        },true);

        this.el.addEventListener('mouseleave', function (evt) {
            if (currentMode !== "AR") {
                targetObject = undefined;
            }
        },true);

        this.el.addEventListener('raycaster-intersected', function(evt) {
                if (currentMode !== "AR") {
                    recordRaycaster("RaycasterIntersected",this.id);
                    targetObject = this.id;
                    if( trackingCursor ) {
                        if( this.id === "student1standing" ) {
                            document.getElementById("student1hilite").setAttribute("visible","true");
                        } else if( this.id === "student2standing" ) {
                            document.getElementById("student2hilite").setAttribute("visible","true");
                        }
                    }
                }
        },true);

        this.el.addEventListener('raycaster-intersected-cleared', function(evt) {
                if (currentMode !== "AR") {
                    recordRaycaster("RaycasterCleared",this.id);
                    targetObject = undefined;
                    if( trackingCursor ) {
                        if( this.id === "student1standing" ) {
                            document.getElementById("student1hilite").setAttribute("visible","false");
                        } else if( this.id === "student2standing" ) {
                            document.getElementById("student2hilite").setAttribute("visible","false");
                        }
                    }
                }
        },true);

        if( this.el.id === "introEarth" ) {
            this.el.addEventListener('cardboardbutton', function () {
                if ( hmdReady && ( currentMode !== "AR" ) ) {
                    document.getElementById("openingaudio").play();
                    document.getElementById("introEarth").emit('startshrink');
                    document.getElementById("picturesphere").emit('startexpand');
                    document.getElementById("classroom").setAttribute("visible","true");
                }
            },true);
        } else {
            this.el.addEventListener('cardboardbutton', function (evt) {
                if ( currentMode !== "AR" ) {
                    recordRaycaster("Touched",this.id);
                    targetObject = this.id;
                }
            },true);
        }
    }
});