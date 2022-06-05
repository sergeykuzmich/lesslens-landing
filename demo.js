import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from ' https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from ' https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';


let container = document.getElementById('vr'); 
let BG = getComputedStyle(container,"").getPropertyValue("background-color");

const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio( window.devicePixelRatio, false )
renderer.setSize( container.clientWidth, container.clientHeight );
renderer.toneMapping = THREE.LinearToneMapping; // THREE.NoToneMapping THREE.LinearToneMapping THREE.ReinhardToneMapping THREE.CineonToneMapping THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding
container.appendChild( renderer.domElement );

const scene = new THREE.Scene()
scene.background = new THREE.Color( BG );


scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(  20,
    container.clientWidth / container.clientHeight, 0.01, 10
)
camera.position.z = 1
// camera.position.y = 1

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true



//HDRI Lightning

// new RGBELoader()
//     .setDataType( THREE.UnsignedByteType )
//     .setPath( './demo/' )
//     .load( 'environment.hdr', function ( texture ) {

//     let hdri = pmremGenerator.fromEquirectangular( texture ).texture;

//     scene.background = BG;
//     scene.environment = hdri;

//     texture.dispose();
//     pmremGenerator.dispose();
// })
// let pmremGenerator = new THREE.PMREMGenerator( renderer );
// pmremGenerator.compileEquirectangularShader();

//Global Light

let globaLight = new THREE.AmbientLight( BG, 0.6); // soft white light
scene.add( globaLight );


const loader = new GLTFLoader()
loader.load(
    './demo/model.gltf',
    function (gltf) {
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
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
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