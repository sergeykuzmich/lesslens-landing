import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from ' https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/RGBELoader.js';

let container, scene, gltfLoader, environment, renderer, manager, progress;
let camera, mixer, globaLight, hdri, pmremGenerator;


const pbar = document.getElementById('progress');
const loadScreen = document.getElementById('load-screen');
const loadCounter = document.getElementById("counter");
const slide = document.querySelector(".slide");

init();

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
        render()
    
    };
    manager.onError = function ( url ) {

        console.log( 'There was an error loading ' + url );
    
    };
    
    // Renderer

    renderer = new THREE.WebGLRenderer( { antialias:true } );
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


    //HDRI Lightning

    new RGBELoader( manager )
        .setDataType( THREE.UnsignedByteType )
        .setPath( './scene/' )
        .load( 'environment.hdr', function ( texture ) {

        hdri = pmremGenerator.fromEquirectangular( texture ).texture;

        scene.background = hdri;
        scene.environment = hdri;

        texture.dispose();
        pmremGenerator.dispose();
    })
    pmremGenerator = new THREE.PMREMGenerator( renderer );
    pmremGenerator.compileEquirectangularShader();

    //Global Light

    globaLight = new THREE.AmbientLight( BG, 0.6); // soft white light
    scene.add( globaLight );


    // Sky

    const skyGeometry = new THREE.SphereGeometry(5, 24, 24);
    const skyMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./scene/sky.png'), side: THREE.BackSide });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
   
    // GLTF Scene loader

    gltfLoader = new GLTFLoader( manager );
    gltfLoader.load( './scene/default.gltf', function ( gltf ) { 
        environment = gltf.scene;
        environment.castShadows
        scene.add( environment );

        // console.log( gltf.animations.length )

        gltf.scene.traverse( function ( object ) {

            if ( object.isMesh ) {
                object.transparent = true;
            }  else if ( object.isMaterial ) {
                object.transparent = true;
            }
        
        } );

        camera = gltf.cameras[0];
        camera.aspect = container.clientWidth / container.clientHeight;
        
        camera.zoom = document.body.clientWidth < 1024 ? 0.55 : 1;
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

}


function onWindowResize() {
    renderer.setPixelRatio( window.devicePixelRatio, false )
    renderer.setSize( container.clientWidth, container.clientHeight );
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    render();
}


function render() {
    mixer.setTime( -slide.getBoundingClientRect().top / window.innerHeight * 2.6);
    window.requestAnimationFrame(render);
    renderer.render( scene, camera );
}



