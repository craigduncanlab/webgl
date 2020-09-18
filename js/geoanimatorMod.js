//Basic ingredients of a three js visualisaton are : scene, camera, renderer
//Craig Duncan - WebGL demo using three.js.
//Requires images to be in same folder.

/* In summary, the three.js/WebGL renderer works with, as a minimum, a scene, objects and the camera position.
An object is created using a material (mesh type) and a geometry. 
Three.js is a wrapper that takes care of vertices ops for what it calls a 'mesh'
Materials in three.js are sets of points and edges with position and rotation that are then passed
 on to WebGL shaders. (mat4 matrices)
*/

/* Javascript loading conventions differ depending on the environment and the use of modules.
Here, the code is written on the assumption that you are running it over a server, and that the 
three.js library is available in the three.js-master folder (downloaded as zip).
When using as modules, the /jsm rather than /js folder should be used */

import * as THREE from "../three-js.master/build/three.module.js"; //relative to this file
import {OrbitControls} from "../three-js.master/examples/jsm/controls/OrbitControls.js"; //choose the jsm folder for module bindings
import {GLTFLoader} from "../three-js.master/examples/jsm/loaders/GLTFLoader.js";

//the THREE prefix will only apply to the methods in the three.module.js file.

//make these variables global so we can use them in the two functions below.
var scene,camera,renderer,controls
var geometry,material, myGMan
var myCanvas //
var groundTexture
var gltfloader
var myObject, myObject2, myObject3 //only myObject rotates at moment.

init();
animate();

function init() {
	scene = new THREE.Scene();
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	myCanvas=renderer.domElement; //for clarity in naming

	/* 
	Add the WebGL 'canvas' to the document. 
	renderer.domElement , in practice, the 'canvas for WebGL'. It is an instance of HTMLCanvasElement.
	See https://threejs.org/docs/#api/en/renderers/WebGLRenderer
	*/
	document.body.appendChild( myCanvas ); //renderer.domElement 

	//--- 'MESH' ---
	/* The three.js library has a 'mesh' function to create the set of vertices for an object.  This takes 2 arguments - geometry and material.
	This is actually a simple way to create an object without having to supply your own vertices, edges etc
	It is still possible to load in your own set, and three.js provides the loader class for this.

	//--- (a) GEOMETRY ---
	/*
	nb see: https://threejs.org/docs/index.html#api/en/core/Geometry
	vertices are more directly accessible in Geometry than BufferGeometry (slight performance drop)
	what follows are individual ports of 'BufferGeometry' options
	nb: "Any modification after instantiation does not change the geometry."

	e.g. https://threejs.org/docs/index.html#api/en/geometries/CircleBufferGeometry
	radius — Radius of the circle, default = 1.
	segments — Number of segments (triangles), minimum = 3, default = 8.
	thetaStart — Start angle for first segment, default = 0 (three o'clock position).
	thetaLength — The central angle, often called theta, of the circular sector. The default is 2*Pi, which makes for a complete circle.
	*/

	//general variables
	var Pi = 3.141592653;

	
	
	
	// --- (b) MATERIAL FOR MESH ---
	
	//Different ways to store colour information

	var col1='#8AC'; //blue/gray
	var col2=0x00ff00  //luminescent green!
	var col3 = new THREE.Color('pink');

	
	geometry=getGeometry(3); //4=torus
	material=getMaterial(4); //seagull wrap	5=trump
	//always create objects outside animation loop
	myObject = new THREE.Mesh( geometry, material );  
	myObject.position.set(0,100,0);  //This will 'float' above the xz plane
	// -- Add the completed object to the scene ---

	scene.add( myObject );

	// --- MESH (SECOND OBJECT FOR A PLANE SURFACE TO USE AS GROUND) --- 

	/*

	width — Width along the X axis. Default is 1.
	height — Height along the Y axis. Default is 1.
	widthSegments — Optional. Default is 1. 
	heightSegments — Optional. Default is 1.

	*/
	addFloor();
	addBackWall();

	gltfloader = new GLTFLoader();
	//relative location 
	var truckfile='../three-js.master/examples/models/gltf/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf'; //truck is in three.js assets
	var scale1=4.0; //magnify truck
	var helmetfile='../three-js.master/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
	var scale3=12.0; //magnify truck
	var loadfile5='';
	var gingerfile='../three-js.master/examples/models/gltf/ginger/gingerman3.gltf';
	var scale2=0.2; //gingerbread man needs small scale
	/*
	OPTIONAL OBJECTS
	var myObject6=loadObject(gingerfile,scale2,0,0,0); //ground level.  Loads and adds to scene as node.
	var myObject5=loadObject(truckfile,scale1,0,100,0);
	var myObject2=loadObject(helmetfile,scale3,0,50,0);
	*/

	//try an update to the helmet texture and update:
	/*
	gullmaterial=getMaterial(4); //if you can't access the texture directly...replace the whole mesh...
	myObject2 = new THREE.Mesh()
	myObject2.material.needsUpdate = true
	myObject2.material.map.needsUpdate = true; //'map' refers to the texture in the material object.  See arguments to THREE.Mesh..()
	*/

	//TO DO : reference to positions outside  

	// ---- CAMERA ---
	//Some good tips on this here: https://discoverthreejs.com/tips-and-tricks/

	//camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	
	/*

	fov — Camera frustum vertical field of view.
	aspect — Camera frustum aspect ratio.
	near — Camera frustum near plane.
	far — Camera frustum far plane.  Once camera position is > far, it loses 'scene'.  Objects > far not displayed.

*/
	//---setup your camera according to your conventions for the scene...//
	var camx=0; //(0,100,100)
	var camy=200;  // if your plane (floor) is xz plane then y values are height.  You are looking with camera so that z is depth though.
	var camz=600; //back from origin, on same side as light.
    var farcam=800; //how far we 'see' from camera
	var nearcam = 0.1; //how far from camera we start to 'see'
	camera = new THREE.PerspectiveCamera(45, 4 / 3, nearcam, farcam);  //(fov=45 deg, aspect, near, far); 
	// relative to the frustum 'near'
	camera.position.set(camx, camy, camz);
	camera.lookAt(0,200,0); //keep this at same level as the camera i.e. horizontal

    console.log(camera)
    controls = new OrbitControls(camera,myCanvas); //no need for THREE prefix here.
 
	/* Point light casts shadows; ambient light does not
	https://threejs.org/docs/#api/en/lights/AmbientLight
	*/
	const ltcol = 0xFFFFFF; //white
	const intensity = 1; //full
	var lightchoice=1;
	var light; //for light 'source'
	if (lightchoice==1) {
		light = new THREE.PointLight(ltcol);
	}
	else {	
		light = new THREE.AmbientLight(ltcol, intensity); //no shadows
	}
	light.position.set(100,100,100); //this is relative... (100,250,100).  Set to light source at moment.
	//https://threejs.org/docs/#api/en/math/Color
	//https://github.com/mrdoob/three.js/blob/master/src/math/Color.js
	scene.background = new THREE.Color('skyblue');
	scene.add(light);
}

function addFloor() {
	var groundGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);  //this avoids need to set 3D vertices directly

	const planeSize = 40; //this is actually number of images that should fill the plane...origin to edge?
    const gloader = new THREE.TextureLoader();
    var image_floor1='../pexels-photo-2579912.jpg'
    var image_floor2='../Seagull.png'
    groundTexture=gloader.load(image_floor1); //insert an image as the 'texture'
    groundTexture.magFilter = THREE.NearestFilter; //
    /* To tile, use this:
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    var grepeats = planeSize / 2;  //effectively (20,20)
    groundTexture.repeat.set(grepeats, grepeats);
    */
    /*
    // If texture is used for color information, set colorspace.
	groundTexture.encoding = THREE.sRGBEncoding;
	// UVs use the convention that (0, 0) corresponds to the upper left corner of a texture.
	groundTexture.flipY = false;
	*/

	var groundMaterial = new THREE.MeshBasicMaterial( { map: groundTexture, side: THREE.DoubleSide } ); //up and down
	
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    //origin is 0,0
	ground.position.y = 0;  //y=-50.5
	ground.rotation.x = Math.PI/2;//0 is default xy plane but this rotation takes it to yz plane so changing z position navigates horizontally to origin
	
	scene.add(ground);
}

function addBackWall() {
	//class pythreejs.PlaneGeometry(width=1, height=1, widthSegments=1, heightSegments=1)
	var wallGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);  //this avoids need to set 3D vertices directly

	const wall_loader = new THREE.TextureLoader();
    var wall='../pexels-photo-2579912.jpg'; //space
    var wallTexture=wall_loader.load(wall); //insert an image as the 'texture'
    wallTexture.magFilter = THREE.NearestFilter; //
	var wallMaterial = new THREE.MeshBasicMaterial( { map: groundTexture, side: THREE.DoubleSide } ); //up and down
	
    var wall = new THREE.Mesh(wallGeometry, wallMaterial);
    //origin is 0,0
	wall.position.y = 0;  //y=-50.5
	wall.position.z = -100; //push away from user pov. -100 places it behind the sphere if sphere is at z=0
	wall.rotation.x = 0; //default is xy so ok.  Math.PI/2;//0 is default xy plane but this rotation takes it to yz plane so changing z position navigates horizontally to origin
	
	scene.add(wall);
}

function getMaterial(materialtype) {
	var material;
	if (materialtype==1) {
		material = new THREE.MeshStandardMaterial( {color: col3 }); //args are a list
	}
	else if (materialtype==2) {
		//material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ); //luminescent green!
		//this material is NOT affected by lights.
		material = new THREE.MeshBasicMaterial( { color: col1 }); 
	}
	else if (materialtype==3) {
		material = new THREE.MeshNormalMaterial(); //basic faces with different colours 
	}
	else if (materialtype==4) {
		// Create a texture loader so we can load the image file
		var imgloader = new THREE.TextureLoader();
		material = new THREE.MeshLambertMaterial({
 		 	//map: imgloader.load('../Seagull.png')
 		 	map: imgloader.load('../Seagull.png') //or planet
		});
	}
	else if (materialtype==5) {
		// Create a texture loader so we can load the image file
		var imgloader = new THREE.TextureLoader();
		material = new THREE.MeshLambertMaterial({
 		 	map: imgloader.load('../Seagull.png')
		});
	}
	return material;
}

function getGeometry(choice) {
	var geometry;
	var radius,segments,thetaStart,thetaLength,widthSegments,heightSegments,phiStart,tube, radialSegments,tubularSegments,arc
	
	if (choice==1) {
		radius = 3; //default is 1
		segments = 36; //default is 8 (2 x 4 quaters) but you'll need at least 36 in this app to look like a smooth circle.  
		thetaStart=0;
		thetaLength=2*Pi; //length or end? Units in radians?  Is Pi a variable?
		geometry = new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength);
	}
	if (choice==2) {
		geometry = new THREE.BoxGeometry(1.0,4.0,9.0); //(each of the 6 faces is really 2 x triangles). Optional arguments: length, breadth, height.
	}
	/* SPHERE
		radius — sphere radius. Default is 1.
		widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
		heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
		phiStart — specify horizontal starting angle. Default is 0.
		phiLength — specify horizontal sweep angle size. Default is Math.PI * 2.
		thetaStart — specify vertical starting angle. Default is 0.
		thetaLength — specify vertical sweep angle size. Default is Math.PI.
	*/

	if (choice==3) {
		/* 
		radius=3;
		widthSegments=150; //actually the *number of* [width] or [height] segments.  With 1 you get two tri prisms.  Use > 36.
		heightsegments=150;
		phiStart=0;
		phiLength=2*Pi;
		thetaStart=0;
		thetaLength=Math.Pi;
		geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
		*/
		//args are: radius, segs(w), segs(h).  Use ratio of about 1:20 for these?
		//Try and choose segs that are multiples of 4.
		geometry = new THREE.SphereGeometry(30,68,32); 
	}

		/*
		radius - Radius of the torus, from the center of the torus to the center of the tube. Default is 1. 
		tube — Radius of the tube. Default is 0.4. 
		radialSegments — Default is 8 
		tubularSegments — Default is 6. 
		arc — Central angle. Default is Math.PI * 2.
		*/
	if (choice==4) {
		radius = 20; //large shape radius.  Make sure this is suitable scale.
		tube = 5; //tube:radius of 1:4 for balanced 'tyre' or 'donut' look.  tube:radius of 1:20 for 'hoop'. 
		radialSegments=16; //for cross-section of ?
		tubularSegments=100; //for 
		arc = Math.Pi;
		geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);

		//we also set the image for the material here
		}
		return geometry;
}

//async: interior function loader may not have executed before 'loadObject' returns 
function loadObject( loadfile, scale1,x,y,z ){
	//use callback function to assign obj  //var loader = new GLTFLoader();  //no need to refer to THREE
	gltfloader.load(loadfile, function(obj) {
        var character = obj.scene; //are these just scene elements??
        character.position.set(x,y,z);
        character.rotation.x=0; //Math.PI;  x is 'out' of the image plane yz at moment.  So x rotations put it behind image.
        character.rotation.y=Math.PI; //we've rotated the image so it sits flat on the xz plane...?
        //character.rotation.z=Math.PI;
        character.scale.set(scale1,scale1,scale1);
		scene.add( character );  //do this outside function?
		console.log("inside:"+obj);
	});
}

//this is the incremental adjustment.  Include in animate loop to spin
function do_rotation() {
	//set rotation outside animation function
	myObject.rotation.x += 0.01; //0.01 x 60 fps = 0.6 rps.
	myObject.rotation.y += 0.01;
}

//javascript request to update canvas
function animate() {
	requestAnimationFrame( animate );  //javscript built-in.  Here, it self-calls the parent function in a loop.  When?  Every time a repaint can be done.
	do_rotation();
	//render
	renderer.render( scene, camera );
}
