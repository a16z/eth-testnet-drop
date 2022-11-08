// @ts-nocheck
import './Background.css';
import * as THREE from "three"
import { useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Physics, usePlane, useCompoundBody, useSphere } from "@react-three/cannon"
import { Environment, Sky, useGLTF } from "@react-three/drei"
import { EffectComposer, SSAO } from "@react-three/postprocessing"

let NUM = 20;
let BOUNDING_SPHERE_SCALAR = .9;
let SIZES = [0.8, 0.9, 1, 1.05, 1.2]
let FORCE_MULTIPLIER = 25;
let MOUSE_BALL_SIZE = 3;

const diamondMaterial = new THREE.MeshStandardMaterial(
  { 
      color: "#5c8fe6", 
      metalness: 0.05 
  })
const diamonds = [...Array(NUM)].map(() => {
  let size = SIZES[Math.floor(Math.random() * SIZES.length)];
  return { 
    args: size, 
    mass: size * 2, 
    position: [-5, 5, 0],
    angularDamping: 0.2, 
    linearDamping: 0.95 
  }
})

function Diamond(
  { center = new THREE.Vector3(), ...props }
  ) {
  const eth_logo = useGLTF("/ethereum_3d_logo.glb")
  // Create bounding box
  const [ref, api] = useCompoundBody(() => ({
    ...props,
    shapes: [
      { 
        type: "Sphere", 
        position: [0, 0, 0.1], // Cause some spin
        args: [props.args * BOUNDING_SPHERE_SCALAR], 
      }
    ],
  }))

  // Force towards center
  useEffect(() => api.position.subscribe(
    (p) => {
      api.applyForce(center.set(p[0], p[1], p[2]).normalize().multiplyScalar(-props.args * FORCE_MULTIPLIER).toArray()
    , [0, 0, 0])
  }))


  return (
      <mesh 
        ref={ref}
        dispose={null}
        castShadow 
        scale={0.0025 * props.args} 
        position={[0, 0, 0]} 
        geometry={eth_logo.nodes.Object_2.geometry} 
        material={diamondMaterial} 
        rotation={[0, Math.PI / 2, Math.PI / 2]}></mesh>
  )
}

function Collisions(props: {mousePos?: any}) {
  usePlane(() => ({ position: [0, 0, 0], rotation: [0, 0, 0] }))
  usePlane(() => ({ position: [0, 0, 8], rotation: [0, -Math.PI, 0] }))
  usePlane(() => ({ position: [0, -6, 0], rotation: [-Math.PI / 2, 0, 0] }))
  usePlane(() => ({ position: [0, 6, 0], rotation: [Math.PI / 2, 0, 0] }))
  const [, api] = useSphere(() => ({ type: "Kinematic", args: [MOUSE_BALL_SIZE] }))

  return useFrame((_) => {
    api.position.set(props.mousePos.x, props.mousePos.y, 0)
  })
}

const Background = (props: {children?: any}) => {
  let coords = useRef({x: 0, y: 0})

  const handleMouseMove = (event) => {
    let x = event.clientX / window.innerWidth;
    let y = event.clientY / window.innerHeight;

    let x_adjusted = (x - 0.5) * 10;
    let y_adjusted = (y - 0.5) * -1 * 10;

    coords.x = x_adjusted;
    coords.y = y_adjusted;
  };

  return (
  <div 
    onMouseMove={handleMouseMove} 
    style={{margin: 0, padding: 0, height: "100%", width: "100%"}}> 

    {/* Main bkg component */}
    <div className="relative" style={{height: "100%", width: "100%"}}>
      <Canvas
        shadows
        dpr={1.5}
        gl={{ alpha: false, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 35, near: 10, far: 40 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}>
        <ambientLight intensity={1} />
        <spotLight position={[20, 20, 25]} penumbra={1} angle={0.2} color="white" castShadow shadow-mapSize={[512, 512]} />
        <directionalLight position={[0, 5, -4]} intensity={4} />
        <directionalLight position={[0, -15, -0]} intensity={4} color="red" />
        <Physics gravity={[0, 0, 0]}>
          <Collisions 
          mousePos={coords}
          />
          {diamonds.map((props, i) => {
            return <Diamond 
              key={i} 
              {...props} />
          }) /* prettier-ignore */}
        </Physics>
        <Environment files="/adamsbridge.hdr" />
        <EffectComposer multisampling={0}>
          <SSAO samples={11} radius={0.1} intensity={20} luminanceInfluence={0.6} color="red" />
          <SSAO samples={21} radius={0.03} intensity={10} luminanceInfluence={0.6} color="red" />
        </EffectComposer>
        <Sky></Sky>
      </Canvas>
    </div>

    {/* The children */}
    {props.children}

  </div>

)
  }

export default Background;