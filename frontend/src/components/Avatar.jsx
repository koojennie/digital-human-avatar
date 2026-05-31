import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import facialExpressions from "../constants/facialExpressions";
import visemesMapping from "../constants/visemeMappings";
import { useChat } from "../context/ChatContext";

export function Avatar(props) {
  const group = useRef();
  const { nodes, materials, scene } = useGLTF("models/avatar.glb");
  const { animations } = useGLTF("/models/animations.glb");

  const { actions, mixer } = useAnimations(animations, group);
  const { currentAvatarMessage, onAvatarMessagePlayed } = useChat();

  const [animation, setAnimation] = useState("Idle");
  const [currentExpression, setCurrentExpression] = useState("default");
  const [blink, setBlink] = useState(false);

  // State lokal untuk melacak audio dan status berbicara di dalam Three.js
  const [lipsync, setLipsync] = useState(null);
  const [audioState, setAudioState] = useState(null);
  const [isTalking, setIsTalking] = useState(false); // <--- KUNCI UTAMA SINKRONISASI

  useEffect(() => {
    if (!currentAvatarMessage || !currentAvatarMessage.audio) {
      setAnimation("Idle");
      setCurrentExpression("default");
      setLipsync(null);
      setIsTalking(false);
      
      if (audioState) {
        audioState.pause();
        setAudioState(null);
      }
      return;
    }

    // Ambil metadata gerakan dari Gemini
    setAnimation(currentAvatarMessage.metadata?.animation || "TalkingOne");
    setCurrentExpression(currentAvatarMessage.metadata?.facialExpression || "smile");
    setLipsync(currentAvatarMessage.lipsync);
    setIsTalking(true); // Mulai berbicara

    // Jalankan Audio Lokal khusus untuk trigger sinkronisasi frame
    const audioUrl = `data:audio/wav;base64,${currentAvatarMessage.audio}`;
    const newAudio = new Audio(audioUrl);
    
    newAudio.play().catch((err) => {
      console.error("Autoplay diblokir browser:", err);
      onAvatarMessagePlayed(); // Bypass antrean agar tidak hang
    });

    setAudioState(newAudio);

    newAudio.onended = () => {
      setIsTalking(false); 
      setAnimation("Idle"); 
      setCurrentExpression("default");
      setLipsync(null);
      onAvatarMessagePlayed(); ;
    };

    return () => {
      newAudio.pause();
      setIsTalking(false);
    };
  }, [currentAvatarMessage]);

  // --- CONTROLLER MIXER ANIMASI TUBUH ---
  useEffect(() => {
    if (actions && actions[animation]) {
      actions[animation]
        .reset()
        .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.4)
        .play();

      return () => {
        if (actions[animation]) {
          actions[animation].fadeOut(0.4);
        }
      };
    }
  }, [animation, actions, mixer]);

  // --- MATA BERKEDIP ---
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

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index === undefined || child.morphTargetInfluences[index] === undefined) return;
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );
      }
    });
  };

  // --- LOOPING RENDER PER FRAME (60 FPS) ---
  useFrame(() => {
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    let activeMorphTarget = null;
    let actualTalkingFrame = false;

    // HANYA JALANKAN LIPSYNC JIKA STATUS IS_TALKING TRUE DAN AUDIO SEDANG JALAN
    if (isTalking && currentAvatarMessage && lipsync && audioState && !audioState.paused) {
      const currentAudioTime = audioState.currentTime;
      const mouthCues = lipsync.mouthCues || [];

      for (let i = 0; i < mouthCues.length; i++) {
        const mouthCue = mouthCues[i];
        if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
          if (mouthCue.value !== "X") {
            activeMorphTarget = visemesMapping[mouthCue.value];
            actualTalkingFrame = true;
          }
          break;
        }
      }
    }

    // JALANKAN UPDATE MORPH TARGETS LIP-SYNC SECARA TEGAS
    Object.values(visemesMapping).forEach((value) => {
      if (value === activeMorphTarget && actualTalkingFrame) {
        lerpMorphTarget(value, 0.85, 0.35); // Buka mulut sesuai fonetik
      } else {
        lerpMorphTarget(value, 0, 0.55); // PAKSA TUTUP RAPAT JIKA DIAM / SUARA HABIS
      }
    });

    // Kontrol pergerakan dagu (Jaw)
    if (actualTalkingFrame) {
      lerpMorphTarget("jawOpen", 0.35, 0.2);
    } else {
      lerpMorphTarget("jawOpen", 0, 0.4); // Paksa dagu mengatup rapat kembali
    }

    // LOGIKA EKSPRESI WAJAH BERSAMA
    const targetExpression = facialExpressions[currentExpression];
    if (targetExpression) {
      Object.keys(targetExpression).forEach((morphKey) => {
        const expressionIntensity = actualTalkingFrame
          ? targetExpression[morphKey] * 0.2
          : targetExpression[morphKey];

        if (morphKey !== activeMorphTarget) {
          lerpMorphTarget(morphKey, expressionIntensity, 0.1);
        }
      });
    }
  });

  return (
    <group ref={group} {...props} dispose={null} position={[-0.1, -0.5, 0]}>
      <group name="Scene">
        <group name="Armature">
          <primitive object={nodes.Hips} />
          <skinnedMesh name="Streamoji_Body" geometry={nodes.Streamoji_Body.geometry} material={materials.Streamoji_Body} skeleton={nodes.Streamoji_Body.skeleton} />
          <skinnedMesh name="Streamoji_Outfit_Bottom" geometry={nodes.Streamoji_Outfit_Bottom.geometry} material={materials.Streamoji_Outfit_Bottom} skeleton={nodes.Streamoji_Outfit_Bottom.skeleton} />
          <skinnedMesh name="Streamoji_Outfit_Footwear" geometry={nodes.Streamoji_Outfit_Footwear.geometry} material={materials.Streamoji_Outfit_Footwear} skeleton={nodes.Streamoji_Outfit_Footwear.skeleton} />
          <skinnedMesh name="Streamoji_Outfit_Top" geometry={nodes.Streamoji_Outfit_Top.geometry} material={materials.Streamoji_Outfit_Top} skeleton={nodes.Streamoji_Outfit_Top.skeleton} />
        </group>
        <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Streamoji_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
        <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Streamoji_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
        <skinnedMesh name="Streamoji_Head" geometry={nodes.Streamoji_Head.geometry} material={materials.Streamoji_Skin} skeleton={nodes.Streamoji_Head.skeleton} morphTargetDictionary={nodes.Streamoji_Head.morphTargetDictionary} morphTargetInfluences={nodes.Streamoji_Head.morphTargetInfluences} />
        <skinnedMesh name="Streamoji_Teeth" geometry={nodes.Streamoji_Teeth.geometry} material={materials.Streamoji_Teeth} skeleton={nodes.Streamoji_Teeth.skeleton} morphTargetDictionary={nodes.Streamoji_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Streamoji_Teeth.morphTargetInfluences} />
      </group>
    </group>
  );
}

useGLTF.preload("models/avatar.glb");
useGLTF.preload("/models/animations.glb");