import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import morphTargets from "../constants/morphTargets";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import facialExpressions from "../constants/facialExpressions";
import { useSpeech } from "../hooks/useSpeech";
import visemesMapping from "../constants/visemeMappings";
import { useChat } from "../context/ChatContext";

export function Avatar(props) {
  const group = useRef();
  const { nodes, materials, scene } = useGLTF("models/avatar.glb");
  const { animations } = useGLTF("/models/animations.glb");

  const { actions, mixer } = useAnimations(animations, group);
  // const { message, onMessagePlayed } = useSpeech();
  const { currentAvatarMessage, onAvatarMessagePlayed } = useChat();

  const [animation, setAnimation] = useState("Idle");
  const [currentExpression, setCurrentExpression] = useState("default");
  const [blink, setBlink] = useState(false);

  // state untuk Lip-sync & Audio
  const [lipsync, setLipsync] = useState();
  const [audioState, setAudioState] = useState();

  useEffect(() => {
    // if (!message) {
    if (!currentAvatarMessage) {
      setAnimation("Idle");
      setCurrentExpression("default");
      setLipsync(null);

      if (audioState) {
        audioState.pause();
        setAudioState(null);
      }
      return;
    }

    // set animasi dan ekspresi dari Gemini
    // setAnimation(message.animation || "Idle");
    // setCurrentExpression(message.facialExpression || "default");
    // setLipsync(message.lipsync);

    setAnimation(currentAvatarMessage.metadata?.animation || "TalkingOne");
    setCurrentExpression(
      currentAvatarMessage.metadata?.facialExpression || "smile",
    );
    setLipsync(currentAvatarMessage.lipsync);

    // audio
    // const newAudio = new Audio("data:audio/mp3;base64" + message.audio);
    // newAudio.play();
    // setAudioState(newAudio);
    // newAudio.onended = onMessagePlayed;

    const audioUrl = `data:audio/wav;base64,${currentAvatarMessage.audio}`;
    const newAudio = new Audio(audioUrl);

    newAudio.play().catch((err) => {
      console.error(
        "Autoplay diblokir oleh browser. User harus klik layar terlebih dahulu.",
        err,
      );
      onAvatarMessagePlayed(); // Bypass antrean jika diblokir agar tidak hang
    });

    setAudioState(newAudio);

    newAudio.onended = () => {
      console.log("Kalimat selesai disuarakan.");
      onAvatarMessagePlayed();
    };

    return () => {
      newAudio.pause();
    };
  }, [currentAvatarMessage]);

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
      blinkTimeout = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => {
            setBlink(false);
            nextBlink();
          }, 200);
        },
        THREE.MathUtils.randInt(1000, 5000),
      );
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed,
        );
      }
    });
  };

  // useFrame(() => {
  //   lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
  //   lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

  //   // 2. logika lip-sync Rhubarb -> ARKit
  //   const appliedMorphTargets = [];
  //   // if (message && lipsync && audioState) {
  //   if (currentAvatarMessage && lipsync && audioState) {
  //     const currentAudioTime = audioState.currentTime;
  //     for (let i = 0; i < lipsync.mouthCues.length; i++) {
  //       const mouthCue = lipsync.mouthCues[i];
  //       if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
  //         appliedMorphTargets.push(visemesMapping[mouthCue.value]);
  //         lerpMorphTarget(visemesMapping[mouthCue.value], 1, 0.2);
  //         break;
  //       }
  //     }
  //   }

  //   // reset morph target bibir yang tidak terpakai
  //   Object.values(visemesMapping).forEach((value) => {
  //     if (appliedMorphTargets.includes(value)) {
  //       return;
  //     }
  //     lerpMorphTarget(value, 0, 0.1);
  //   });

  //   // 3. logika ekspresi wajah (selain bibir agar tidak bentrok dengan lip-sync)
  //   const targetExpression = facialExpressions[currentExpression];
  //   if (targetExpression) {
  //     Object.keys(targetExpression).forEach((morphKey) => {
  //       if (!appliedMorphTargets.includes(morphKey)) {
  //         lerpMorphTarget(morphKey, targetExpression[morphKey], 0.1);
  //       }
  //     });
  //   }
  // });

  useFrame(() => {
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    let activeMorphTarget = null;
    let isTalking = false;

    // 1. CARI TAHU APAKAH AVATAR SEDANG BERBICARA ATAU DIAM
    if (currentAvatarMessage && lipsync && audioState) {
      const currentAudioTime = audioState.currentTime;
      const mouthCues = lipsync.mouthCues || [];

      for (let i = 0; i < mouthCues.length; i++) {
        const mouthCue = mouthCues[i];
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          // FIX KEYWORD "X": Jika nilainya X (diam), jangan set activeMorphTarget agar mulut merapat netral
          if (mouthCue.value !== "X") {
            activeMorphTarget = visemesMapping[mouthCue.value];
            isTalking = true; // Avatar terdeteksi sedang memicu huruf vokal/konsonan aktif
          }
          break;
        }
      }
    }

    // 2. JALANKAN UPDATE MORPH TARGETS LIP-SYNC SECARA TEGAS
    Object.values(visemesMapping).forEach((value) => {
      if (value === activeMorphTarget) {
        // Kecepatan dinaikkan ke 0.3 untuk respons membuka bibir yang lebih renyah
        // lerpMorphTarget(value, 1, 0.3);
        lerpMorphTarget(value, 0.85, 0.35);
      } else {
        // Kecepatan penutupan dinaikkan ke 0.45 agar langsung merapat ke posisi semula tanpa jeda monyong
        // lerpMorphTarget(value, 0, 0.45);
        lerpMorphTarget(value, 0, 0.5);
      }
    });

    if (isTalking) {
      lerpMorphTarget("jawOpen", 0.35, 0.2); // Menggerakkan dagu ke bawah saat bersuara
    } else {
      lerpMorphTarget("jawOpen", 0, 0.3); // Mengatupkan dagu kembali saat diam
    }

    // 3. LOGIKA EKSPRESI WAJAH (DENGAN REDUKSI INTERFERENSI)
    const targetExpression = facialExpressions[currentExpression];
    if (targetExpression) {
      Object.keys(targetExpression).forEach((morphKey) => {
        // Jika avatar sedang berbicara, kurangi intensitas ekspresi senyum di area bibir (dikali 0.2)
        // Supaya tarikan senyum Gemini tidak merusak bentuk huruf lip-sync Rhubarb
        const expressionIntensity = isTalking
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
  );
}

useGLTF.preload("models/avatar.glb");
useGLTF.preload("/models/animations.glb");
