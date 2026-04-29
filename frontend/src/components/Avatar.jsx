import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Avatar(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('models/avatar.glb')
  const { actions } = useAnimations(animations, group)
  return (
    <group ref={group} {...props} dispose={null} position={[0, -0.5, 0]}>
      <group name="Scene">
        <group name="Armature">
          <primitive object={nodes.Hips} />
          <skinnedMesh
            name="Streamoji_Body"
            geometry={nodes.Streamoji_Body.geometry}
            material={materials.Streamoji_Body}
            skeleton={nodes.Streamoji_Body.skeleton}
          />
          <skinnedMesh
            name="Streamoji_Outfit_Bottom"
            geometry={nodes.Streamoji_Outfit_Bottom.geometry}
            material={materials.Streamoji_Outfit_Bottom}
            skeleton={nodes.Streamoji_Outfit_Bottom.skeleton}
          />
          <skinnedMesh
            name="Streamoji_Outfit_Footwear"
            geometry={nodes.Streamoji_Outfit_Footwear.geometry}
            material={materials.Streamoji_Outfit_Footwear}
            skeleton={nodes.Streamoji_Outfit_Footwear.skeleton}
          />
          <skinnedMesh
            name="Streamoji_Outfit_Top"
            geometry={nodes.Streamoji_Outfit_Top.geometry}
            material={materials.Streamoji_Outfit_Top}
            skeleton={nodes.Streamoji_Outfit_Top.skeleton}
          />
        </group>
        <skinnedMesh
          name="EyeLeft"
          geometry={nodes.EyeLeft.geometry}
          material={materials.Streamoji_Eye}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
        <skinnedMesh
          name="EyeRight"
          geometry={nodes.EyeRight.geometry}
          material={materials.Streamoji_Eye}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
        <skinnedMesh
          name="Streamoji_Head"
          geometry={nodes.Streamoji_Head.geometry}
          material={materials.Streamoji_Skin}
          skeleton={nodes.Streamoji_Head.skeleton}
          morphTargetDictionary={nodes.Streamoji_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Streamoji_Head.morphTargetInfluences}
        />
        <skinnedMesh
          name="Streamoji_Teeth"
          geometry={nodes.Streamoji_Teeth.geometry}
          material={materials.Streamoji_Teeth}
          skeleton={nodes.Streamoji_Teeth.skeleton}
          morphTargetDictionary={nodes.Streamoji_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Streamoji_Teeth.morphTargetInfluences}
        />
      </group>
    </group>
  )
}

useGLTF.preload('models/avatar.glb')