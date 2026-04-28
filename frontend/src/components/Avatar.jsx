import { useGLTF } from "@react-three/drei";

export const Avatar = (props) => {
  const { scene } = useGLTF("/models/avatar.glb");

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, -0.3, 0]}
      {...props}
    />
  );
};

useGLTF.preload("/models/avatar.glb");