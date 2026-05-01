import React, { useEffect, useRef, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import morphTargets from '../constants/morphTargets';
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import facialExpressions from "../constants/facialExpressions";
import { useSpeech } from "../hooks/useSpeech";
import visemesMapping from "../constants/visemeMappings";

export function Avatar(props) {
  const group = useRef()
  const { nodes, materials, scene } = useGLTF('models/avatar.glb')

  const { animations } = useGLTF("/models/animations.glb");
  const { actions, mixer } = useAnimations(animations, group);
  const { message, onMessagePlayed } = useSpeech();

  const [animation, setAnimation] = useState("Idle");
  const [currentExpression, setCurrentExpression] = useState("default");
  const [blink, setBlink] = useState(false);

  // state untuk Lip-sync & Audio
  const [lipsync, setLipsync] = useState();
  const [audio, setAudio] = useState();

  useEffect(() => {
    if (!message) {
      setAnimation("Idle");
      setCurrentExpression("default");
      return;
    }
    
    // set animasi dan ekspresi dari Gemini
    setAnimation(message.animation || "Idle");
    setCurrentExpression(message.facialExpression || "default");
    setLipsync(message.lipsync);
    
    // audio
    const newAudio = new Audio("data:audio/mp3;base64," + message.audio);
    newAudio.play();
    setAudio(newAudio);
    newAudio.onended = onMessagePlayed;
  }, [message]);

  useEffect(() => {
    if (actions && actions[animation]) {
      actions[animation]
        .reset()
        .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
        .play();

      return () => {
        if (actions[animation]) {
          actions[animation].fadeOut(0.5);
        }
      };
    }
  }, [animation, actions, mixer]);

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  useEffect(() => {
    if (!message) return;
    
    // memutar audio Base64 yang dikirim Gemini/ElevenLabs dari backend
    const audio = new Audio("data:audio/mp3;base64," + message.audio);
    audio.play();
    setAudio(audio);
    
    // memberi tahu sistem bahwa pesan selesai sehingga pesan berikutnya bisa diputar
    audio.onended = onMessagePlayed; 
  }, [message]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index === undefined || child.morphTargetInfluences[index] === undefined) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );
      }
    });
  };

  useFrame(() => {
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    // 2. logika lip-sync Rhubarb -> ARKit
    const appliedMorphTargets = [];
    if (message && lipsync && audio) {
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
          appliedMorphTargets.push(visemesMapping[mouthCue.value]);
          lerpMorphTarget(visemesMapping[mouthCue.value], 1, 0.2);
          break;
        }
      }
    }

    // reset morph target bibir yang tidak terpakai
    Object.values(visemesMapping).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.1);
    });

    // 3. logika ekspresi wajah (selain bibir agar tidak bentrok dengan lip-sync)
    const targetExpression = facialExpressions[currentExpression];

    const allMorphsToReset = [
      "mouthSmileLeft", "mouthSmileRight", "cheekPuff", "eyeSquintLeft", "eyeSquintRight",
      "mouthFrownLeft", "mouthFrownRight", "mouthShrugLower", "browInnerUp", "eyeLookDownLeft",
      "eyeLookDownRight", "browDownLeft", "browDownRight", "mouthPressLeft", "mouthPressRight",
      "noseSneerLeft", "noseSneerRight", "eyeWideLeft", "eyeWideRight", "browOuterUpLeft", 
      "browOuterUpRight", "mouthDimpleLeft", "mouthDimpleRight"
    ];

    if (targetExpression) {
      allMorphsToReset.forEach((morphKey) => {
        if (!targetExpression[morphKey]) {
          lerpMorphTarget(morphKey, 0, 0.1);
        }
      });
      Object.keys(targetExpression).forEach((morphKey) => {
        if (!appliedMorphTargets.includes(morphKey)) {
          lerpMorphTarget(morphKey, targetExpression[morphKey], 0.1);
        }
      });
    }
  });

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
useGLTF.preload('/models/animations.glb')