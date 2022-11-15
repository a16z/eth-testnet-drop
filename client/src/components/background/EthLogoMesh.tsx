import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3, Triangle, BufferGeometry, BufferAttribute, MeshStandardMaterial, DoubleSide } from "three";

let A = 0.35;
let B = 0.5;
let C = 0.65;
let D = .55;
let E = 0.7;
let F = 0.95;
let W = .35;
let ZEPTH = .2;
const vertices = [
    // A
    -W, D,  0,
    0, F,  0,
    0,  E,  ZEPTH,

    // C
    -W,  B,  0,
    0,  C,  0,
    0, A,  ZEPTH,

    // E
    -W,  B,  0,
    0, A,  ZEPTH,
    0, 0, 0,

    // Reflect across X
    // A
    W, D,  0,
    0, F,  0,
    0,  E,  ZEPTH,

    // C
    W,  B,  0,
    0,  C,  0,
    0, A,  ZEPTH,

    // E
    W,  B,  0,
    0, A,  ZEPTH,
    0, 0, 0,

    // Reflect across Z
    // A
    W, D,  0,
    0, F,  0,
    0,  E,  -ZEPTH,

    // C
    -W,  B,  0,
    0,  C,  0,
    0, A,  -ZEPTH,

    // E
    -W,  B,  0,
    0, A,  -ZEPTH,
    0, 0, 0,

    // Reflect across X
    // A
    -W, D,  0,
    0, F,  0,
    0,  E,  -ZEPTH,

    // C
    W,  B,  0,
    0,  C,  0,
    0, A,  -ZEPTH,

    // E
    W,  B,  0,
    0, A,  -ZEPTH,
    0, 0, 0,

    // Bottoms
    0,  E,  -ZEPTH,
    -W, D,  0,
    0,  E,  ZEPTH,

    0,  E,  -ZEPTH,
    W, D,  0,
    0,  E,  ZEPTH,

];

function getNormal(points: number[]): number[] {
    let triangle = new Triangle(
        new Vector3(points[0], points[1], points[2]),
        new Vector3(points[3], points[4], points[5]),
        new Vector3(points[6], points[7], points[8]),
        )
    let targetVector = new Vector3();
    triangle.getNormal(targetVector);

    let flip = false
    for (let point of points) {
        if (point < 0) {
            flip = true;
        }
    }

    let asArr = flip ? [-targetVector.x, -targetVector.y, -targetVector.z] : [targetVector.x, targetVector.y, targetVector.z];
    return [...asArr, ...asArr, ...asArr];
}

function normalizeYValues(points: number[]): number[] {
    let max = 0;
    for (let i = 1; i <= points.length; i += 3) {
        if (points[i] > max)  {
            max = points[i];
        }
    }
    let diff = max / 2;
    for (let i = 1; i <= points.length; i += 3) {
        points[i] -= diff;
    }

    return points;
}

export default function EthLogoMesh() {
    let geometry = EthLogoGeometry();
    const material = new MeshStandardMaterial( { color: "gray", side: DoubleSide } );

    let boxRef = useRef<Mesh>(null!);

    useFrame(() => {
        boxRef.current.rotation.x += 0.005;
        boxRef.current.rotation.y += 0.01;
    })

    return (<mesh ref={boxRef} geometry={geometry} material={material}></mesh>)
}

export function EthLogoGeometry(scale: number = 1): BufferGeometry {
    let geometry = new BufferGeometry();
    let normalizedVerts = normalizeYValues(vertices)
    let mappedVerts = normalizedVerts.map(vert => vert *= scale);

    // Create normals
    const chunkSize = 9;
    let allNormals: number[] = []
    for (let i = 0; i < mappedVerts.length; i += chunkSize) {
        const chunk = mappedVerts.slice(i, i + chunkSize);
        allNormals.push(...getNormal(chunk));
    }

    geometry.setAttribute( 'position', new BufferAttribute( new Float32Array(mappedVerts), 3));
    geometry.setAttribute( 'normal', new BufferAttribute( new Float32Array(allNormals), 3))
    geometry.computeVertexNormals();
    geometry.normalizeNormals()

    return geometry;
}