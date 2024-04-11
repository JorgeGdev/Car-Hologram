import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import holographicVertexShader from "./shaders/holographic/vertex.glsl"
import holographicFragmentShader from "./shaders/holographic/fragment.glsl"
import {RGBELoader} from "three/addons/loaders/RGBELoader.js"


/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})





//ENVIRONMENT MAP



const rgbeLoader = new RGBELoader()




//HDR  - RBGE - EQUIRECTANGULAR

rgbeLoader.load("/environmentMaps/2/2k.hdr",
(environmentMap)=>
{
       environmentMap.mapping = THREE.EquirectangularReflectionMapping
    

   scene.environment = environmentMap
    scene.background = environmentMap

 } 
 )



/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-3, 0, 0)
camera.fov = 85; // Aumenta o disminuye según sea necesario
camera.updateProjectionMatrix();
scene.add(camera)

//gui.add(camera.position, "x").min(-10).max(10).step(0.001)
//gui.add(camera.position, "y").min(-10).max(10).step(0.001)
//gui.add(camera.position, "z").min(-10).max(10).step(0.001)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Renderer
 */
const rendererParameters = {}
rendererParameters.clearColor = '#ffffff'

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor(rendererParameters.clearColor)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

gui
    .addColor(rendererParameters, 'clearColor')
    .onChange(() =>
    {
        renderer.setClearColor(rendererParameters.clearColor)
    })

/**
 * Material
 */

const materialParameters = {}
materialParameters.color = "#79f570"

gui.addColor(materialParameters, "color")
.onChange(()=>
{

    material.uniforms.uColor.value.set(materialParameters.color)


})


const material = new THREE.ShaderMaterial({
    vertexShader:holographicVertexShader,
    fragmentShader:holographicFragmentShader,
    transparent:true,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color))
    },
    side: THREE.DoubleSide,
    depthWrite:false,
    blending: THREE.AdditiveBlending
})


// GODZILLA
let suzanne = null
gltfLoader.load(
    './car/scene.gltf',
    (gltf) =>
    {
        suzanne = gltf.scene
        suzanne.traverse((child) =>
        {
            if(child.isMesh)
                child.material = material
                scene.add(gltf.scene)
        })
        //suzanne.scale.set(5, 5, 5)
        //suzanne.position.y = -3
        
        scene.add(suzanne)
    }
)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //update Material

    material.uniforms.uTime.value = elapsedTime

    // Rotate objects
    if(suzanne)
    {
        //suzanne.rotation.x = - elapsedTime * 0.2
        suzanne.rotation.y = elapsedTime * - 0.05
    }

  
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()