const facialExpressions = {
  default: {},
  smile: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    cheekPuff: 0.4,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    mouthDimpleLeft: 0.2,
    mouthDimpleRight: 0.2,
  },
  sad: {
    mouthFrownLeft: 0.8,
    mouthFrownRight: 0.8,
    mouthShrugLower: 0.6,
    browInnerUp: 0.7,
    eyeLookDownLeft: 0.4,
    eyeLookDownRight: 0.4,
  },
  annoyed: {
    browDownLeft: 0.9,
    browDownRight: 0.9,
    mouthPressLeft: 0.6,
    mouthPressRight: 0.6,
    eyeSquintLeft: 0.5,
    eyeSquintRight: 0.5,
    noseSneerLeft: 0.4,
    noseSneerRight: 0.4,
    mouthRollLower: 0.3,
  },
  surprised: {
    jawOpen: 0.3,
    mouthFunnel: 0.6,
    eyeWideLeft: 0.7,
    eyeWideRight: 0.7,
    browInnerUp: 0.9,
    browOuterUpLeft: 0.5,
    browOuterUpRight: 0.5,
  },
};

export default facialExpressions;