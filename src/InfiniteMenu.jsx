import { quat, vec3 } from "gl-matrix";
import { useEffect, useRef, useState } from "react";
import "./InfiniteMenu.css";

const TAU = Math.PI * 2;

function spherePoints() {
  const t = Math.sqrt(5) * 0.5 + 0.5;
  const vertices = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ].map(([x, y, z]) => vec3.fromValues(x, y, z));
  const faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];
  const midpointCache = new Map();
  const midpoint = (a, b) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (midpointCache.has(key)) return midpointCache.get(key);
    const point = vec3.scale(
      vec3.create(),
      vec3.add(vec3.create(), vertices[a], vertices[b]),
      0.5,
    );
    vertices.push(point);
    midpointCache.set(key, vertices.length - 1);
    return vertices.length - 1;
  };
  faces.forEach(([a, b, c]) => {
    midpoint(a, b);
    midpoint(b, c);
    midpoint(c, a);
  });
  return vertices.map((point) => vec3.normalize(vec3.create(), point));
}

function rotatePoint(point, rotation) {
  return vec3.transformQuat(vec3.create(), point, rotation);
}

function loadImage(source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

export default function InfiniteMenu({
  items = [],
  scale = 1,
  backgroundColor = "#111c1a",
  onItemClick,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    rotation: quat.create(),
    velocity: [0, 0],
    pointer: null,
    rendered: [],
    zoom: 0.72,
    targetZoom: 0.72,
  });
  const [activeItem, setActiveItem] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let frameId;
    let cancelled = false;
    const points = spherePoints();
    const images = [];
    const state = stateRef.current;
    const fitCanvas = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    Promise.all(
      (items.length ? items : [{ image: "" }]).map((item) =>
        loadImage(item.image),
      ),
    ).then((loaded) => {
      if (!cancelled) images.push(...loaded);
    });

    const rotationFromDrag = (deltaX, deltaY) => {
      const axis = vec3.fromValues(deltaY * 0.008, deltaX * 0.008, 0);
      const amount = Math.hypot(axis[0], axis[1]);
      if (!amount) return;
      vec3.normalize(axis, axis);
      const delta = quat.setAxisAngle(quat.create(), axis, amount);
      state.rotation = quat.normalize(
        quat.create(),
        quat.multiply(quat.create(), delta, state.rotation),
      );
    };

    const getPointAt = (event) => {
      const bounds = canvas.getBoundingClientRect();
      return [event.clientX - bounds.left, event.clientY - bounds.top];
    };

    const handlePointerDown = (event) => {
      state.lastPointerMoved = false;
      state.targetZoom = 1.16;
      state.pointer = { ...getPointAt(event), time: performance.now() };
      canvas.setPointerCapture?.(event.pointerId);
      setIsMoving(true);
    };
    const handlePointerMove = (event) => {
      if (!state.pointer) return;
      const [x, y] = getPointAt(event);
      const dx = x - state.pointer.x;
      const dy = y - state.pointer.y;
      if (Math.hypot(dx, dy) > 3) state.lastPointerMoved = true;
      rotationFromDrag(dx, dy);
      state.velocity = [dx * 0.0015, dy * 0.0015];
      state.pointer = { x, y, time: performance.now() };
    };
    const handlePointerUp = () => {
      state.pointer = null;
      state.targetZoom = 0.72;
      setIsMoving(false);
    };
    const handleClick = () => {
      if (state.lastPointerMoved) return;
      state.targetZoom = 0.72;
    };
    const handleWheel = (event) => {
      event.preventDefault();
      const direction = event.deltaY || event.deltaX;
      const amount = Math.max(-42, Math.min(42, direction * 0.08));
      rotationFromDrag(amount, event.deltaX * 0.04);
      state.velocity = [amount * 0.0018, event.deltaX * 0.0008];
    };
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        rotationFromDrag(event.key === "ArrowLeft" ? -34 : 34, 0);
        state.velocity = [event.key === "ArrowLeft" ? -0.02 : 0.02, 0];
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        rotationFromDrag(0, event.key === "ArrowUp" ? -34 : 34);
        state.velocity = [0, event.key === "ArrowUp" ? -0.02 : 0.02];
      }
      if (event.key === "Enter" || event.key === " ")
        onItemClick?.(items.find((item) => item.id === state.activeId));
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", fitCanvas);
    fitCanvas();

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      state.zoom += (state.targetZoom - state.zoom) * 0.1;
      const radius = Math.min(width, height) * 0.52 * scale * state.zoom;
      const camera = Math.max(240, Math.min(width, height) * 0.7 * state.zoom);
      context.clearRect(0, 0, width, height);
      state.rendered = [];

      if (!state.pointer) {
        const velocityAmount = Math.hypot(state.velocity[0], state.velocity[1]);
        if (velocityAmount > 0.0001) {
          const velocityAxis = vec3.normalize(vec3.create(), [
            state.velocity[1],
            state.velocity[0],
            0,
          ]);
          const velocityRotation = quat.setAxisAngle(
            quat.create(),
            velocityAxis,
            velocityAmount,
          );
          state.rotation = quat.normalize(
            quat.create(),
            quat.multiply(quat.create(), velocityRotation, state.rotation),
          );
        }
        state.velocity[0] *= 0.96;
        state.velocity[1] *= 0.96;
      }

      const visible = points
        .map((point, index) => {
          const rotated = rotatePoint(point, state.rotation);
          const depth = (rotated[2] + 1) / 2;
          return { point, rotated, depth, index };
        })
        .sort((a, b) => a.depth - b.depth);

      if (
        !state.pointer &&
        Math.abs(state.velocity[0]) < 0.02 &&
        Math.abs(state.velocity[1]) < 0.02
      ) {
        const front = visible[visible.length - 1].rotated;
        const axis = vec3.cross(vec3.create(), front, [0, 0, 1]);
        const distance = Math.min(
          Math.acos(Math.max(-1, Math.min(1, front[2]))),
          0.12,
        );
        if (vec3.length(axis) > 0.0001 && distance > 0.001) {
          vec3.normalize(axis, axis);
          const correction = quat.setAxisAngle(
            quat.create(),
            axis,
            distance * 0.08,
          );
          state.rotation = quat.normalize(
            quat.create(),
            quat.multiply(quat.create(), correction, state.rotation),
          );
        }
      }

      let nearest = null;
      visible.forEach(({ rotated, depth, index }) => {
        const item = items.length ? items[index % items.length] : null;
        const image = images[index % Math.max(1, images.length)];
        const x =
          centerX +
          (rotated[0] * radius * camera) / (camera + rotated[2] * radius);
        const y =
          centerY -
          (rotated[1] * radius * camera) / (camera + rotated[2] * radius);
        const discRadius = (7 + Math.pow(depth, 4.2) * 132) * scale;
        const alpha = 0.16 + depth * 0.84;
        if (rotated[2] > (nearest?.rotated[2] ?? -2))
          nearest = { item, rotated, index };
        if (item) state.rendered.push({ item, x, y, radius: discRadius });

        context.save();
        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(x, y, discRadius, 0, TAU);
        context.clip();
        context.filter = "saturate(1.7) contrast(1.06)";
        if (image)
          context.drawImage(
            image,
            x - discRadius,
            y - discRadius,
            discRadius * 2,
            discRadius * 2,
          );
        else {
          context.fillStyle = "#20232d";
          context.fill();
        }
        context.filter = "none";
        if (item?.accent) {
          context.globalAlpha = alpha * 0.18;
          context.fillStyle = item.accent;
          context.fill();
        }
        context.restore();
      });

      if (nearest?.item && nearest.item.id !== state.activeId) {
        state.activeId = nearest.item.id;
        setActiveItem(nearest.item);
      }
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", fitCanvas);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("keydown", handleKeyDown);
    };
  }, [backgroundColor, items, onItemClick, scale]);

  return (
    <div
      className="infinite-menu"
      style={{ "--infinite-menu-background": backgroundColor }}
    >
      <canvas
        ref={canvasRef}
        className="infinite-menu-canvas"
        tabIndex="0"
        role="img"
        aria-label="Interactive infinite menu. Use arrow keys to rotate."
      />
      {activeItem && (
        <>
          <div className={`infinite-menu-title ${isMoving ? "inactive" : ""}`}>
            <span className="infinite-menu-eyebrow">NOW IN VIEW</span>
            <h2>{activeItem.label}</h2>
            <p>{activeItem.description}</p>
          </div>
          <button
            className={`infinite-menu-action ${isMoving ? "inactive" : ""}`}
            onClick={() => onItemClick?.(activeItem)}
            aria-label={`Open ${activeItem.label}`}
          >
            <ArrowIcon />
          </button>
        </>
      )}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  );
}
