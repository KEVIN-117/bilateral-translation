import { Results } from "@mediapipe/holistic";

export function extractKeypoints(results: Results): number[] {
  // Pose: 33 landmarks * 4 (x,y,z,visibility) = 132
  const pose = results.poseLandmarks
    ? results.poseLandmarks.flatMap((res) => [res.x, res.y, res.z, res.visibility || 0])
    : new Array(33 * 4).fill(0);

  // Face: 468 landmarks * 3 (x,y,z) = 1404
  const face = results.faceLandmarks
    ? results.faceLandmarks.flatMap((res) => [res.x, res.y, res.z])
    : new Array(468 * 3).fill(0);

  // Left Hand: 21 landmarks * 3 (x,y,z) = 63
  const lh = results.leftHandLandmarks
    ? results.leftHandLandmarks.flatMap((res) => [res.x, res.y, res.z])
    : new Array(21 * 3).fill(0);

  // Right Hand: 21 landmarks * 3 (x,y,z) = 63
  const rh = results.rightHandLandmarks
    ? results.rightHandLandmarks.flatMap((res) => [res.x, res.y, res.z])
    : new Array(21 * 3).fill(0);

  return [...pose, ...face, ...lh, ...rh];
}
