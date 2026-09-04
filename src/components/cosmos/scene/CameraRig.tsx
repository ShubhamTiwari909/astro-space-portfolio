import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { BANDS } from '../../../lib/bands';
import { scrollState } from '../../../lib/scrollProgress';
import {
	CAMERA_FOV,
	CAMERA_LAG_MS,
	KEYFRAME_LOOKATS,
	KEYFRAME_POSITIONS,
	LOOKAT_CURVE,
	POSITION_CURVE,
} from './flightPath';

/**
 * The camera rig — master plan §4.1.
 *
 * Reads scroll from the shared singleton INSIDE useFrame, via a plain
 * object, never through React state. A setState here would re-render the
 * tree 60 times a second and cost more than every other optimisation in
 * this project combined (§22 frame-loop rules).
 *
 * Nothing is allocated per frame: every Vector3 below is created once at
 * module or mount scope and mutated in place.
 */

const SEGMENTS = BANDS.length - 1;

// Pre-allocated scratch. Never reassigned, only mutated.
const targetPos = new Vector3();
const targetLook = new Vector3();
const currentLook = new Vector3();

interface Props {
	/** Reduced motion: cut between keyframes instead of interpolating. */
	staticCamera: boolean;
}

export default function CameraRig({ staticCamera }: Props) {
	const camera = useThree((s) => s.camera);
	const initialised = useRef(false);

	useEffect(() => {
		if ('fov' in camera) {
			camera.fov = CAMERA_FOV;
			camera.updateProjectionMatrix();
		}
	}, [camera]);

	useFrame((_, delta) => {
		// Flight progress comes from section midpoints, not raw document
		// scroll: sections differ in height, and §4.1 maps the flight to the
		// reading order, not to pixels.
		const { bandIndex, bandBlend } = scrollState;

		if (staticCamera) {
			// Cut, don't glide. Vestibular safety is not negotiable (§16.4).
			const i = Math.min(bandIndex, KEYFRAME_POSITIONS.length - 1);
			camera.position.copy(KEYFRAME_POSITIONS[i]);
			camera.lookAt(KEYFRAME_LOOKATS[i]);
			return;
		}

		const t = SEGMENTS > 0 ? (bandIndex + bandBlend) / SEGMENTS : 0;
		const clamped = Math.min(1, Math.max(0, t));

		POSITION_CURVE.getPoint(clamped, targetPos);
		LOOKAT_CURVE.getPoint(clamped, targetLook);

		if (!initialised.current) {
			// Arrive already in position: the hero must not animate on load
			// (§9.3). Movement begins only when the visitor scrolls.
			camera.position.copy(targetPos);
			currentLook.copy(targetLook);
			camera.lookAt(currentLook);
			initialised.current = true;
			return;
		}

		// Frame-rate-independent exponential smoothing toward the target, so
		// the camera trails the scrollbar rather than tracking it rigidly.
		const alpha = 1 - Math.exp((-delta * 1000) / CAMERA_LAG_MS);
		camera.position.lerp(targetPos, alpha);
		currentLook.lerp(targetLook, alpha);
		camera.lookAt(currentLook);
	});

	return null;
}
