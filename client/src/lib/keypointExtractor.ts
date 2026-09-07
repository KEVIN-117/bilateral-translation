import { HolisticLandmarkerResult } from "@mediapipe/tasks-vision";

export function extractKeypoints(results: HolisticLandmarkerResult): number[] {
  // En tasks-vision, los resultados vienen en arrays de arrays (para múltiples personas).
  // Solo nos interesa la primera persona detectada ([0]).

  // Pose: 33 landmarks * 4 (x,y,z,visibility) = 132
  const poseLandmarks = results.poseLandmarks && results.poseLandmarks.length > 0 ? results.poseLandmarks[0] : null;
  const pose = poseLandmarks
    ? poseLandmarks.flatMap((res) => [res.x, res.y, res.z, res.visibility || 0])
    : new Array(33 * 4).fill(0);

  // Face: 468 landmarks * 3 (x,y,z) = 1404 (Nota: refineFaceLandmarks debe estar false para que sean 468, si es true son 478)
  const faceLandmarks = results.faceLandmarks && results.faceLandmarks.length > 0 ? results.faceLandmarks[0] : null;
  let face = faceLandmarks
    ? faceLandmarks.flatMap((res) => [res.x, res.y, res.z])
    : new Array(468 * 3).fill(0);
    
  // Cortar a 1404 en caso de que devuelva 478 landmarks (1434)
  if (face.length > 1404) {
    face = face.slice(0, 1404);
  }

  // Left Hand: 21 landmarks * 3 (x,y,z) = 63
  const lhLandmarks = results.leftHandLandmarks && results.leftHandLandmarks.length > 0 ? results.leftHandLandmarks[0] : null;
  const lh = lhLandmarks
    ? lhLandmarks.flatMap((res) => [res.x, res.y, res.z])
    : new Array(21 * 3).fill(0);

  // Right Hand: 21 landmarks * 3 (x,y,z) = 63
  const rhLandmarks = results.rightHandLandmarks && results.rightHandLandmarks.length > 0 ? results.rightHandLandmarks[0] : null;
  const rh = rhLandmarks
    ? rhLandmarks.flatMap((res) => [res.x, res.y, res.z])
    : new Array(21 * 3).fill(0);

  return [...pose, ...face, ...lh, ...rh];
}
