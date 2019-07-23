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
let targetCounts = {};
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
                    document.getElementById("introEarth").emit('startshrink');
                    document.getElementById("picturesphere").emit('startexpand');
                    document.getElementById("crescendo").play();
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

/**
 * Pivot the scene when user enters VR to face the earth.
 * Courtesy of the folks at Supermedium. :-)
 */
AFRAME.registerComponent('recenter', {
    schema: {
      target: {default: ''}
    },
  
    init: function () {
      var sceneEl = this.el.sceneEl;
      this.matrix = new THREE.Matrix4();
      this.frustum = new THREE.Frustum();
      this.rotationOffset = 0;
      this.euler = new THREE.Euler();
      this.euler.order = 'YXZ';
      this.startingTarget = new THREE.Vector3();
      this.recenter = this.recenter.bind(this);
      this.checkInViewAfterRecenter = this.checkInViewAfterRecenter.bind(this);
      this.target = document.querySelector(this.data.target);
  
      // Delay to make sure we have a valid pose.
      sceneEl.addEventListener('enter-vr', () => setTimeout(this.recenter, 100));
      // User can also recenter the menu manually.
      sceneEl.addEventListener('menudown', this.recenter);
      sceneEl.addEventListener('thumbstickdown', this.recenter);
      window.addEventListener('vrdisplaypresentchange', this.recenter);
    },
  
    recenter: function () {
      var euler = this.euler;
      euler.setFromRotationMatrix(this.el.sceneEl.camera.el.object3D.matrixWorld, this.euler.order);
      this.el.object3D.rotation.y = euler.y + this.rotationOffset;
      // Check if the menu is in camera frustum in next tick after a frame has rendered.
      console.log("Recentered...checking that target is in view...")
      setTimeout(this.checkInViewAfterRecenter, 0);
    },
  
    /*
     * Sometimes the quaternion returns the yaw in the [-180, 180] range.
     * Check if the menu is in the camera frustum after recenter it to
     * decide if we apply an offset or not.
     */
    checkInViewAfterRecenter: function () {
      var bottomVec3 = new THREE.Vector3();
      var topVec3 = new THREE.Vector3();
  
      return function () {
        var camera = this.el.sceneEl.camera;
        var frustum = this.frustum;
        var startingTarget = this.startingTarget;
  
        camera.updateMatrix();
        camera.updateMatrixWorld();
        frustum.setFromMatrix(this.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  
        // Check if target position (and its bounds) are within the frustum.
        // Check bounds in case looking angled up or down, rather than target central.
        startingTarget.setFromMatrixPosition(this.target.object3D.matrixWorld);
        bottomVec3.copy(startingTarget).y -= 3;
        topVec3.copy(startingTarget).y += 3;
  
        if (frustum.containsPoint(startingTarget) ||
            frustum.containsPoint(bottomVec3) ||
            frustum.containsPoint(topVec3)) { return; }
  
        this.rotationOffset = this.rotationOffset === 0 ? Math.PI : 0;
        // Recenter again with the new offset.
        this.recenter();
      };
    },
  
    remove: function () {
      this.el.sceneEl.removeEventListener('enter-vr', this.recenter);
    }
    
});

AFRAME.registerComponent('cloak', {
    init: function () {
        console.log(this.el.object3D.children);
        let arrayLength = this.el.object3D.children.length;
        for( let arrayPointer = 0; arrayPointer < arrayLength; arrayPointer++ ) {
            if( this.el.object3D.children[arrayPointer].material !== undefined ) {
                this.el.object3D.children[arrayPointer].material.colorWrite = false;
            }
        }
        // this.object3D.children[0].material.colorWrite = true;
    }
});