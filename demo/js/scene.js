import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from ' https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from ' https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';


let container = document.getElementById('scene'); 
let BG = getComputedStyle(container,"").getPropertyValue("background-color");

const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio( window.devicePixelRatio, false )
renderer.setSize( container.clientWidth, container.clientHeight );
renderer.toneMapping = THREE.LinearToneMapping; // THREE.NoToneMapping THREE.LinearToneMapping THREE.ReinhardToneMapping THREE.CineonToneMapping THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true
// renderer.shadowMapType = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding
container.appendChild( renderer.domElement );

const scene = new THREE.Scene()


// Axis Helper
// scene.add(new THREE.AxesHelper(5));

const camera = new THREE.PerspectiveCamera(  24, container.clientWidth / container.clientHeight, 0.01, 10 )
camera.position.set(1, 0.5, 1)
camera.zoom = Math.abs( container.clientWidth / container.clientHeight / Math.sin( camera.fov / 2 ) );
camera.updateProjectionMatrix();

// Orbit Controls

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set( 0, 0, -0.06 );
controls.enableDamping = true;
controls.autoRotate  = true;
controls.autoRotateSpeed = 2;
controls.enablePan = false;
controls.maxDistance = 1;
controls.minDistance = 0.5;

// HDRI Lightning

new RGBELoader()
    .setDataType( THREE.UnsignedByteType )
    .setPath( './demo/' )
    .load( 'environment.hdr', function ( texture ) {

    let hdri = pmremGenerator.fromEquirectangular( texture ).texture;

    scene.background = new THREE.Color( BG );
    scene.environment = hdri;

    texture.dispose();
    pmremGenerator.dispose();
})
let pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

// Plane

// const floor = new THREE.Mesh( new THREE.PlaneGeometry( 0.3, 0.3 ), new THREE.MeshBasicMaterial( {color: BG } ) );
// floor.rotation.x = Math.PI / -2;
// floor.position.set( 0, -0.03, -0.08 );
// scene.add( floor );

// Model

const loader = new GLTFLoader()
loader.load(
    'demo/111.gltf',
    function (gltf) {

        gltf.scene.traverse( function ( object ) {

            if ( object.isMesh ) {
                object.transparent = true;
                object.castShadow = true;
            }  else if ( object.isMaterial ) {
                object.transparent = true;
            }
        
        } );
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight )
    render()
}


function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()

