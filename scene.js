import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from ' https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/RGBELoader.js';

let container, scene, gltfLoader, fbxLoader, environment, controls, renderer, manager;
let camera, target, mixer, cameraMixer, action, clips, clip, clock, hdri, pmremGenerator, grid, composer;
let globaLight, keyLight, fillLight, softBox;

let progress
var mouse = {x: 0, y: 0};
const pbar = document.getElementById('progress');
const loadScreen = document.getElementById('load-screen');
const loadCounter = document.getElementById("counter");
const slider = document.getElementById("slider");
const slide = document.querySelector(".slide");
const snaps = [];

clock = new THREE.Clock();

init();
scroll();


function init() {
    container = document.getElementById('scene'); 

    let BG = getComputedStyle(container,"").getPropertyValue("background-color");

    //Loading Manager

    manager = new THREE.LoadingManager();
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        progress = Math.floor( itemsLoaded / itemsTotal * 100 ) + '%'
        pbar.style.width = progress
        loadCounter.innerHTML = progress
    };
    manager.onLoad = function ( ) {

        loadScreen.style.display = 'none';

        console.log( 'Loading Complete!' );
        container.appendChild( renderer.domElement );
        slider.scrollTo( 0, 0 );
        mixer.setTime( 0 );
        render();

        snaps = snapPoints();
        
    
    };
    manager.onError = function ( url ) {

        console.log( 'There was an error loading ' + url );
    
    };
    
    // Renderer
    renderer = new THREE.WebGLRenderer( { antialias:true } );
    // renderer.setPixelRatio ( container.clientWidth / container.clientHeight  );
    renderer.setPixelRatio( window.devicePixelRatio, false )
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.toneMapping = THREE.LinearToneMapping; // THREE.NoToneMapping THREE.LinearToneMapping THREE.ReinhardToneMapping THREE.CineonToneMapping THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true
    renderer.outputEncoding = THREE.sRGBEncoding

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( BG );

    // grid = new THREE.GridHelper( 5 );
    // scene.add( grid );

    //HDRI Lightning

    new RGBELoader( manager )
        .setDataType( THREE.UnsignedByteType )
        .setPath( './scene/' )
        .load( 'environment.hdr', function ( texture ) {

        hdri = pmremGenerator.fromEquirectangular( texture ).texture;

        scene.background = hdri;
        scene.environment = hdri;
        // scene.background  = new THREE.Color( BG );

        scene.rotation.y = radians(0);

        texture.dispose();
        pmremGenerator.dispose();
    })
    pmremGenerator = new THREE.PMREMGenerator( renderer );
    pmremGenerator.compileEquirectangularShader();

    // Stars
    // function addStar() {
    //     const geometry = new THREE.SphereGeometry(0.01, 12, 12);
    //     const material = new THREE.MeshBasicMaterial({ color: BG, opacity: 0.5, transparent: true, depthWrite: true });
    //     const star = new THREE.Mesh(geometry, material);
      
    //     const [x, y, z] = Array(3)
    //       .fill()
    //       .map(() => THREE.MathUtils.randFloatSpread(6));
      
    //     star.position.set(x, y, z);
    //     scene.add(star);
    //   }
    //   Array(800).fill().forEach(addStar);

    // Sky
    const skyGeometry = new THREE.SphereGeometry(5, 24, 24);
    const skyMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./scene/sky.png'), side: THREE.BackSide });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    
   
    // GLTF Scene loader
    gltfLoader = new GLTFLoader( manager );
    gltfLoader.load( '../scene/default.gltf', function ( gltf ) { 
        environment = gltf.scene;
        environment.castShadows
        scene.add( environment );

        gltf.scene.traverse( function ( object ) {

            // console.log(object);

            // const texture = new THREE.VideoTexture( video )

            if ( object.isLight ) {
                // object.castShadow = true
                // object.shadow.radius = 5;
                // object.shadow.mapSize.width = 1024; // default
                // object.shadow.mapSize.height = 1024; // default
                // object.shadow.camera.near = 0.5; // default
                // object.shadow.camera.far = 500; // default
                // object.shadow.camera.updateProjectionMatrix();
              } else if ( object.isMesh ) {
                // object.castShadow = true
                // object.receiveShadow = true
                object.transparent = true;
              }  else if ( object.isMaterial ) {
                object.transparent = true;
              }
        
        } );

        camera = gltf.cameras[0];
        camera.aspect = container.clientWidth / container.clientHeight;
        
        camera.zoom = document.body.clientWidth < 1024 ? 0.4 : 1;
        camera.updateProjectionMatrix();
        camera.updateMatrix();

        let vector = camera.position.clone();
        vector.applyMatrix4( camera.matrix );


        mixer = new THREE.AnimationMixer( gltf.scene );
        
        gltf.animations.forEach( ( clip ) => {
            mixer.clipAction( clip ).play();
        } );
   
    }, undefined, function ( error ) {
        console.error( error );
    } );


    //Events
    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'mousemove', onMouseMove );
}


function onWindowResize() {
    renderer.setPixelRatio( window.devicePixelRatio, false )
    renderer.setSize( container.clientWidth, container.clientHeight );
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    render();
}

function scroll() {
    let lastKnownScrollPosition = 0;
    let currentSnap = 0
    let ticking = false;

    slider.addEventListener('scroll', function(e) {
    
    let scrollDelta = slider.scrollTop - lastKnownScrollPosition

    lastKnownScrollPosition = slider.scrollTop;

    // if ( currentSnap != snapTo(slider.scrollTop, scrollDelta) ){

    //     let newSnap = snapTo(slider.scrollTop, scrollDelta)
    //     let frame = 0

    //     mixer.setTime(  10 * newSnap / ( slider.clientHeight * 4 ) )
    //     slider.scrollTop = newSnap
    //     currentSnap = newSnap
    // }
    
    if (!ticking) {
            window.requestAnimationFrame(function() {
            mixer.setTime( scrollToFrame(slider.scrollTop) );
            ticking = false;
        });
        render();
        ticking = true;
    } 
    })

}

function render() {
    // window.requestAnimationFrame(render)
    renderer.render( scene, camera );
}

function onMouseMove(event) {
    window.requestAnimationFrame(function() {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        camera.position.z = -mouse.y / 100
        camera.position.x = mouse.x / 100
        render()
    });    
}

function radians( degrees ){ 
    return degrees * Math.PI/180 
} 

function scrollToFrame( position ){ 
    return 7.5 * position / ( slider.clientHeight * (snapPoints().length - 1) )
} 


function snapPoints() {
    const points = [];
    const slides = slider.scrollHeight / slide.clientHeight
    for (let i = 0; i < slides; i++){
        points.push( slide.clientHeight * i );
    }
    return points
}

function snapTo( position, direction ){
    if( direction > 10){
       return snapPoints().filter(x => x >= position)[0]
    } else if (direction < -10){
       return snapPoints().filter(x => x <= position).pop()
    }
}
