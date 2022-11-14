// @ts-nocheck
import './Background.css';
import { Suspense, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Physics, usePlane, useCompoundBody, useSphere } from "@react-three/cannon"
import { Environment, Sky, useGLTF } from "@react-three/drei"
import { EthLogoGeometry } from './EthLogoMesh';
import { DoubleSide, Vector3, MeshStandardMaterial, Matrix4 } from 'three';
import { Perf } from 'r3f-perf'

let NUM = 60;
let BOUNDING_SPHERE_SCALAR = .9;
let SIZES = [0.8, 0.9, 1, 1.05, 1.2]
let FORCE_MULTIPLIER = 25;
let MOUSE_BALL_SIZE = 3;
let SPAWN_SPACE = [20, 5, 0]
let SPAWN_OFFSET = [8, 0, 0]

const ethGeometry = EthLogoGeometry(2);

const diamondMaterial = new MeshStandardMaterial(
  { 
      // color: "#8f99fb", 
      // color: "#e8cdfa", 
      color: "#f3e6fc", 
      metalness: .7,
      roughness: .2,
      side: DoubleSide
  })
const diamonds = [...Array(NUM)].map(() => {
  let size = SIZES[Math.floor(Math.random() * SIZES.length)];
  return { 
    args: size, 
    mass: size * 1.5, 
    position: [
      Math.random() * SPAWN_SPACE[0] - SPAWN_OFFSET[0], 
      Math.random() * SPAWN_SPACE[1] - SPAWN_OFFSET[1], 
      0
    ],
    rotation: [
      2 * Math.PI * Math.random(), 
      2 * Math.PI * Math.random(), 
      2 * Math.PI * Math.random(),
    ],
    angularDamping: 0.2, 
    linearDamping: 0.95 
  }
})

function Diamond(
  { center = new Vector3(), ...props }
  ) {
  const ethGeometryModel = useGLTF("/ethereum_3d_logo.glb")
  // Create bounding box
  const [ref, api] = useCompoundBody(() => ({
    ...props,
    shapes: [
      { 
        type: "Sphere", 
        position: [0, 0, 0.001], // Cause some spin
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
        scale={props.args} 
        position={[0, 0, 0]} 
        geometry={ethGeometry}
        material={diamondMaterial} 
        rotation={[0, Math.PI / 2, Math.PI / 2]}></mesh>
  )
}

let NUM_INSTANCES = 20;
function InstancedClump({ mat = new Matrix4(), vec = new Vector3(), ...props }) {
  const [ref, api] = useCompoundBody(() => 
    { 
    let size = SIZES[Math.floor(Math.random() * SIZES.length)];
      return {
      args: size, 
      mass: size * 2, 
      position: [
        Math.random() * SPAWN_SPACE[0] - SPAWN_OFFSET[0], 
        Math.random() * SPAWN_SPACE[1] - SPAWN_OFFSET[1], 
        0
      ],
      rotation: [
        2 * Math.PI * Math.random(), 
        2 * Math.PI * Math.random(), 
        2 * Math.PI * Math.random(),
      ],
      angularDamping: 0.05, 
      linearDamping: 0.75 ,
    shapes: [
      { 
        type: "Sphere", 
        position: [0, 0, 0.05], // Cause some spin
        args: [size * BOUNDING_SPHERE_SCALAR], 
      }
    ],
  }})

  useFrame(() => {
    for (let i = 0; i < NUM_INSTANCES; i++) {
      ref.current.getMatrixAt(i, mat)
      api.at(i).applyForce(vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-FORCE_MULTIPLIER).toArray(), [0, 0, 0])
    }
  })

  return (
    <instancedMesh ref={ref} castShadow receiveShadow args={[null, null, NUM_INSTANCES]} geometry={ethGeometry} material={diamondMaterial}></instancedMesh>
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

  const handleTouchMove = (event) => {
    let x = event.changedTouches[0].clientX / window.innerWidth;
    let y = event.changedTouches[0].clientY / window.innerHeight;

    let x_adjusted = (x - 0.5) * 10;
    let y_adjusted = (y - 0.5) * -1 * 10;

    coords.x = x_adjusted;
    coords.y = y_adjusted;

  }

  return (
  <div 
    onMouseMove={handleMouseMove} 
    onTouchMove={handleTouchMove}
    style={{margin: 0, padding: 0, height: "100%", width: "100%"}}> 

    {/* Main bkg component */}
    <div className="relative" style={{height: "100%", width: "100%"}}>
      <Canvas
        shadows
        dpr={1.5}
        camera={{ position: [0, 0, 20], fov: 35, near: 10, far: 40 }}>
        <Perf position={'bottom-right'} />

        {/* <fog attach="fog" args={['lightblue', 10, 50]} /> */}
        <ambientLight intensity={0.5} />
        <spotLight position={[20, 20, 25]} penumbra={1} angle={0.2} color="white" castShadow shadow-mapSize={[512, 512]} />
        <directionalLight position={[0, 5, -4]} intensity={3} />
        <directionalLight position={[0, -15, -0]} intensity={4} color="red" />
        <directionalLight position={[-3, 10, 4]} intensity={4} color="orange"/>
        <directionalLight position={[4, 10, 4]} intensity={4} color="green"/>
        <directionalLight position={[-4, 10, 4]} intensity={4} color="blue"/>
        <Suspense fallback={null}>
          <Environment preset="warehouse" />
          <Physics gravity={[0, 0, 0]}>
            <InstancedClump />
            <Collisions mousePos={coords} />
            {/* {diamonds.map((props, i) => <Diamond key={i} {...props} />) } */}
          </Physics>
          <Sky></Sky>
        </Suspense>
      </Canvas>
    </div>

    {/* The children */}
    {props.children}

  </div>

)
  }

export default Background;