import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {   
        window.setTimeout(() =>
        {
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ``
        }, 1000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
)
const gltfLoader = new GLTFLoader(loadingManager)
const textureLoader = new THREE.TextureLoader(loadingManager)
const audioLoader = new THREE.AudioLoader(loadingManager)

/**
 * Base
 */
// // Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader:`
        uniform float uAlpha;
        
        void main()
        {
            gl_FragColor = vec4(105.0/255.0, 89.0/255.0, 74.0/255.0, uAlpha);
        }
    `
 })
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

// Animation functions
const animationDestroy = () =>
{   
    signAvailable = false
    carState = 'destroyed'
    brickSound.play()
    gsap.timeline()
                .to(sign.scale, {x: 0, y: 0, z: 0, duration: 1})
                
    for(const separateAnimation of gltfGroup.animations)
    {   
        const action = mixer.clipAction(separateAnimation)
        action.play()
        action.reset()
        action.timeScale = 1
        action.clampWhenFinished = true
        action.repetitions = 1
    }
}

const animationRebuild = () =>
{   
    signAvailable = false
    carState = 'normal'
    window.setTimeout(() =>
        {
            buildSound.play()
        }, 1550)
    gsap.timeline()
                .to(sign.scale, {x: 0, y: 0, z: 0, duration: 1})
    for(const separateAnimation of gltfGroup.animations)
    {   
        const action = mixer.clipAction(separateAnimation)
        action.reset()
        action.timeScale = -2
        action.clampWhenFinished = true
        action.repetitions = 1
    }
}


/**
 * Textures
 */
const bakedTextureMain = textureLoader.load('./models/test/baked.jpg')
bakedTextureMain.flipY = false
bakedTextureMain.colorSpace = THREE.SRGBColorSpace
const bakedTextureCar = textureLoader.load('./models/test/car_baked.jpg')
bakedTextureCar.flipY = false
bakedTextureCar.colorSpace = THREE.SRGBColorSpace
const bakedTextureSign = textureLoader.load('./models/test/sign.jpg')
bakedTextureSign.flipY = false
bakedTextureSign.colorSpace = THREE.SRGBColorSpace


/**
 * Materials
 */
// Baked material
const bakedMaterialMain = new THREE.MeshBasicMaterial({ map: bakedTextureMain })
const bakedMaterialCar = new THREE.MeshBasicMaterial({ map: bakedTextureCar })
const bakedMaterialSign = new THREE.MeshBasicMaterial({ map: bakedTextureSign })

/**
 * Model
 */
let mixer2 = null
let R2D2 = null
let anakin = []
let obiwan = []
let platformGroup = null
gltfLoader.load(
    './models/test/platform_experiment.glb',
    (gltf) =>
    {   
        gltf.scene.scale.set(0.1, 0.1, 0.1)
        gltf.scene.position.set(0, 0, 0)
        platformGroup = gltf
        gltf.scene.traverse((child) =>
        {   
            // Material
            child.material = bakedMaterialMain
        })
        R2D2 = gltf.scene.children.find((child) => child.name === 'rdHead_low')
        //Anakin Group
        anakin.push(gltf.scene.children.find((child) => child.name === 'anakinHair'))
        anakin.push(gltf.scene.children.find((child) => child.name === 'anakinHead'))
        anakin.push(gltf.scene.children.find((child) => child.name === 'anakinLeftHand'))
        anakin.push(gltf.scene.children.find((child) => child.name === 'anakinLeftLeg'))
        anakin.push(gltf.scene.children.find((child) => child.name === 'anakinLegConnector'))
        anakin.push(gltf.scene.children.find((child) => child.name === 'anakinRightHand'))
        anakin.push(gltf.scene.children.find((child) => child.name === 'anakinRightLeg'))
        anakin.push(gltf.scene.children.find((child) => child.name === 'anakinTorso'))

        //Obiwan Group
        obiwan.push(gltf.scene.children.find((child) => child.name === 'obiwanHair'))
        obiwan.push(gltf.scene.children.find((child) => child.name === 'obiwanHead'))
        obiwan.push(gltf.scene.children.find((child) => child.name === 'obiwanLeftHand'))
        obiwan.push(gltf.scene.children.find((child) => child.name === 'obiwanLeftLeg'))
        obiwan.push(gltf.scene.children.find((child) => child.name === 'obiwanLegConnector'))
        obiwan.push(gltf.scene.children.find((child) => child.name === 'obiwanRightHand'))
        obiwan.push(gltf.scene.children.find((child) => child.name === 'obiwanRightLeg'))
        obiwan.push(gltf.scene.children.find((child) => child.name === 'obiwanTorso'))

        mixer2 = new THREE.AnimationMixer(gltf.scene)
        for(const separateAnimation of gltf.animations)
        {   
            const action = mixer2.clipAction(separateAnimation)
            action.play()
        }

        scene.add(gltf.scene)
    }
)

let sign = null
gltfLoader.load(
    './models/test/sign_low.glb',
    (gltf) =>
    {   
        gltf.scene.scale.set(0.1, 0.1, 0.1)
        gltf.scene.position.set(0, 0, 0)
        sign = gltf.scene.children[0]
        gltf.scene.traverse((child) =>
        {   
            // Material
            child.material = bakedMaterialSign
        })

        scene.add(gltf.scene)
    }
)
let mixer = null
let gltfGroup = null
gltfLoader.load(
    './models/test/car_center.glb',
    (gltf) =>
    {   
        gltfGroup = gltf
        
        gltf.scene.position.set(0, 0, -1.65)
        gltf.scene.scale.set(0.1, 0.1, 0.1)
        gltf.scene.traverse((child) =>
        {   
            // Material
            child.material = bakedMaterialCar
        })

        mixer = new THREE.AnimationMixer(gltfGroup.scene)

        scene.add(gltf.scene)
    }
)


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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(15, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 7, 8)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 0.5
controls.target.z = -0.2
controls.enableDamping = true
controls.maxDistance = 25
controls.autoRotate = true
controls.autoRotateSpeed = -0.5

/**
 * Sounds
 */

// instantiate a listener
const audioListener = new THREE.AudioListener()

// add the listener to the camera
camera.add( audioListener )

// instantiate audio object
const brickSound = new THREE.Audio( audioListener )
const buildSound = new THREE.Audio( audioListener )
const rdwhistleSound = new THREE.Audio( audioListener )
const anakinSound = new THREE.Audio( audioListener )
const obiwanSound = new THREE.Audio( audioListener )

// add the audio object to the scene
scene.add( brickSound )
scene.add( rdwhistleSound )
scene.add( anakinSound )
scene.add( obiwanSound )
scene.add( buildSound )

// load sounds
audioLoader.load('sounds/breaking.mp3', ( audioBuffer ) =>
    brickSound.setBuffer( audioBuffer )
)
audioLoader.load('sounds/rd_whistle.mp3', ( audioBuffer ) =>
    rdwhistleSound.setBuffer( audioBuffer )
)
audioLoader.load('sounds/anakin_sand.mp3', ( audioBuffer ) =>
    anakinSound.setBuffer( audioBuffer )
)
audioLoader.load('sounds/obiwan_hello.mp3', ( audioBuffer ) =>
    obiwanSound.setBuffer( audioBuffer )
)
audioLoader.load('sounds/car_rebuild.mp3', ( audioBuffer ) =>
    buildSound.setBuffer( audioBuffer ) 
)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true 
})
renderer.setClearColor('#68594b')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Tone mapping
renderer.toneMapping = THREE.NoToneMapping
renderer.toneMappingExposure = 3


/**
 * Galaxy
 */
const parameters = {}
parameters.count = 7000
parameters.radius = 5
parameters.randomness = 1.5
parameters.randomnessPower = 3
parameters.insideColor = '#f4b771'
parameters.outsideColor = '#fef486'

let geometry = null
let material = null
let points = null

const generateGalaxy = () =>
{
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)
    const randomness = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius

        positions[i] = (Math.random() - 0.5) * 10
        

        // Randomness
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        randomness[i3 + 0] = randomX
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scale 
        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: `
        uniform float uTime;
        uniform float uSize;
        
        attribute float aScale;
        attribute vec3 aRandomness;
        
        varying vec3 vColor;
        
        void main()
        {
            /**
            * Position 
            */
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
            // Spin
            float angle = atan(modelPosition.x, modelPosition.z);
            float distanceToCenter = length(modelPosition.xz);
            float angleOffset = (1.0 / distanceToCenter) * uTime * 0.03;
            angle += angleOffset;  
            modelPosition.x = cos(angle) * distanceToCenter;
            modelPosition.z = sin(angle) * distanceToCenter;
        
            // Randomness
            modelPosition.xyz += aRandomness;
        
            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectionPosition = projectionMatrix * viewPosition;
            gl_Position = projectionPosition;
        
            /**
            * Size
            */
            gl_PointSize = uSize * aScale;
            gl_PointSize *= (1.0 / - viewPosition.z);
            gl_PointSize = max(gl_PointSize, 7.0);
        
            /**
            * Color
            */
            vColor = color;
        }
        `,
        fragmentShader: `
        varying vec3 vColor;
    
        void main()
        {
            // // Disc
            // float strength = distance(gl_PointCoord, vec2(0.5));
            // strength = step(0.5, strength);
            // strength = 1.0 - strength;
        
            // // Diffuse point
            // float strength = distance(gl_PointCoord, vec2(0.5));
            // strength *= 2.0;
            // strength = 1.0 - strength;
        
            // Light point pattern
            float strength = distance(gl_PointCoord, vec2(0.5));
            strength = 1.0 - strength;
            strength = pow(strength, 10.0);
        
            // Final color
            vec3 color = mix(vec3(0.0), vColor, strength);
            gl_FragColor = vec4(color, 1.0);
        }
        `,
        uniforms:{
            uTime: { value: 0.0 },
            uSize: { value: 150.0 * renderer.getPixelRatio() }
        }
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

// gui.add(parameters, 'count').min(100).max(15000).step(100).onFinishChange(generateGalaxy)
// gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
// gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
// gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
// gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
// gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

/**
 * Generate galaxy
 */

generateGalaxy()


/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Mouse
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height * 2 - 1)
})

window.addEventListener('click', () =>
{
    if(currentIntersect)
    {
        if(currentIntersect === sign)
        {   
            if(signAvailable)
            {
                if(carState === 'normal')
                {
                    animationDestroy()
                }
                else
                {
                    animationRebuild()
                }
            }
        }
        else if(currentIntersect === R2D2)
        {
            rdwhistleSound.play()
        }
        else if(currentIntersect === anakin)
        {
            anakinSound.play()
        }
        else if(currentIntersect === obiwan)
        {
            obiwanSound.play()
        }
    }
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let carState = 'normal'
let signAvailable = true
let currentIntersect = null
let previuosTime = 0
const tick = () =>
{
    // Update controls
    controls.update()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previuosTime
    previuosTime = elapsedTime

    // Update material
    material.uniforms.uTime.value = elapsedTime

    // Update animation
    if(mixer !== null)
    {
        mixer.update(deltaTime)
    }

    if(mixer2 !== null)
    {
        mixer2.update(deltaTime)
    }

    // Test intersect with model
    raycaster.setFromCamera(mouse, camera)
    let anyIntersect = false
    if(sign !== null)
    {
        if(signAvailable === true)
        {   
            const modelIntersects = raycaster.intersectObject(sign)
            if(modelIntersects.length)
            {   
                currentIntersect = sign
                anyIntersect = true
                gsap.timeline()
                    .to(sign.scale, {x: 1.5, y: 1.5, z: 1.5, duration: 1})
                sign.rotation.y = elapsedTime
            }
            else
            {   
                currentIntersect = null
                sign.rotation.y = elapsedTime
                gsap.timeline()
                    .to(sign.scale, {x: 1, y: 1, z: 1, duration: 1})
            }
        }
    }

    if(platformGroup)
    {   
        const rdIntersect = raycaster.intersectObject(R2D2)
        if(rdIntersect.length)
        {   
            if(anyIntersect === false)
            {
                currentIntersect = R2D2
                anyIntersect = true
            }
        }

        for(const mesh of anakin)
        {
            const anakinIntersect = raycaster.intersectObject(mesh)
            if(anakinIntersect.length)
            {   
                if(anyIntersect === false)
                {
                    currentIntersect = anakin
                    anyIntersect = true
                }
            }
        }

        for(const mesh of obiwan)
        {
            const obiwanIntersect = raycaster.intersectObject(mesh)
            if(obiwanIntersect.length)
            {   
                if(anyIntersect === false)
                {
                    currentIntersect = obiwan
                    anyIntersect = true
                }
            }
        }
    }
    if(anyIntersect === false)
    {
        currentIntersect = null
    }

    // Check animation running
    if(gltfGroup)
    {
        for(const separateAnimation of gltfGroup.animations)
        {   
            const action = mixer.clipAction(separateAnimation)
            if(action.isRunning() === false)
            {
                if(signAvailable === false)
                {                  
                    signAvailable = true
                }
            }
        }
    }

    // Car movement
    if(carState === 'normal')
    {
        if(signAvailable)
        {
            if(gltfGroup)
            {
                gltfGroup.scene.rotation.x = Math.sin(elapsedTime) * 0.05
                gltfGroup.scene.rotation.z = Math.sin(elapsedTime + 2) * 0.05
            }
        }
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()