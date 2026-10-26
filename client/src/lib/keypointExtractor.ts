import type { HolisticLandmarkerResult } from "@mediapipe/tasks-vision";

const POSE_OFFSET = 0;
const FACE_OFFSET = 33 * 4;
const LEFT_HAND_OFFSET = FACE_OFFSET + 468 * 3;
const RIGHT_HAND_OFFSET = LEFT_HAND_OFFSET + 21 * 3;
const KEYPOINT_COUNT = RIGHT_HAND_OFFSET + 21 * 3;

type Landmark = { x: number; y: number; z: number; visibility?: number };

function writeLandmarks(
  target: Float32Array,
  landmarks: readonly Landmark[] | undefined,
  offset: number,
  stride: 3 | 4,
  limit: number,
) {
  if (!landmarks) return;

  const count = Math.min(landmarks.length, limit);
  for (let index = 0; index < count; index += 1) {
    const landmark = landmarks[index];
    const position = offset + index * stride;
    target[position] = landmark.x;
    target[position + 1] = landmark.y;
    target[position + 2] = landmark.z;
    if (stride === 4) target[position + 3] = landmark.visibility || 0;
  }
}

/** Keeps the trained model's pose/face/left-hand/right-hand layout. */
export function extractKeypoints(
  results: HolisticLandmarkerResult,
): Float32Array {
  const keypoints = new Float32Array(KEYPOINT_COUNT);
  writeLandmarks(keypoints, results.poseLandmarks?.[0], POSE_OFFSET, 4, 33);
  writeLandmarks(keypoints, results.faceLandmarks?.[0], FACE_OFFSET, 3, 468);
  writeLandmarks(
    keypoints,
    results.leftHandLandmarks?.[0],
    LEFT_HAND_OFFSET,
    3,
    21,
  );
  writeLandmarks(
    keypoints,
    results.rightHandLandmarks?.[0],
    RIGHT_HAND_OFFSET,
    3,
    21,
  );
  return keypoints;
}
