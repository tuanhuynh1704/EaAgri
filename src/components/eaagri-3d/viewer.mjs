import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const HOTSPOT_IDS = Object.freeze([
  "overview",
  "soil",
  "weather",
  "disease",
  "irrigation",
  "assistant",
]);
const labels = {
  overview: "Cây sầu riêng",
  soil: "Cảm biến đất",
  weather: "Trạm thời tiết",
  disease: "AI chẩn đoán",
  irrigation: "Hệ thống tưới",
  assistant: "Trợ lý EaAgri",
};
const glyph = {
  overview: "✦",
  soil: "◉",
  weather: "☀",
  disease: "⌖",
  irrigation: "≈",
  assistant: "✧",
};
const HOTSPOT_OFFSETS = Object.freeze({
  assistant: new T.Vector3(0.46, 0.48, 0.05), // Dời nút trợ lý lên phía trên bên phải, hoàn toàn không che mặt nông dân
  overview: new T.Vector3(0, 0.42, 0),        // Dời lên cao phía trên tán lá đỉnh
  weather: new T.Vector3(0.34, 0.32, 0),      // Dời chếch lên phía ngoài trạm thời tiết
  soil: new T.Vector3(-0.4, 0.22, 0),         // Dời ra phía ngoài bên trái cảm biến đất
  disease: new T.Vector3(0, 0.32, 0),         // Dời lên cao phía trên trái sầu riêng
  irrigation: new T.Vector3(0.36, -0.05, 0),  // Dời sang phía ngoài máy bơm nước
});
const active = new WeakMap();
const node = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};
const button = (text, label, fn) => {
  const b = node("button", "ea3d-button", text);
  b.type = "button";
  b.setAttribute("aria-label", label);
  b.addEventListener("click", fn);
  return b;
};
const valid = (v, suffix = "") =>
  typeof v === "number" && Number.isFinite(v) ? `${v}${suffix}` : "—";

/**
 * Mount a transparent, self-contained 3D component. Call destroy on unmount.
 * Data is display-only. No network calls to AI, Firebase or hardware are made.
 */
export function createEaAgriScene(container, options = {}) {
  if (typeof window === "undefined")
    throw Error("Call createEaAgriScene in a client-side mount effect.");
  if (!(container instanceof HTMLElement))
    throw TypeError("container must be an HTMLElement");
  active.get(container)?.destroy();
  const opts = {
    quality: "auto",
    showCards: true,
    showHotspots: true,
    showFarmer: true,
    autoRotate: false,
    lazy: false,
    maxDpr: 1.25,
    posterUrl: null,
    ...options,
  };
  const base = new URL(options.assetBaseUrl || "../assets/", import.meta.url);
  // Default to optimized 83k model (eaagri-durian-mobile.glb) for buttery 60fps on all laptops
  const quality = opts.quality === "high" ? "high" : "mobile";
  const file =
    quality === "high"
      ? "eaagri-durian-high.glb"
      : "eaagri-durian-mobile.glb";
  let data = { source: "none", ...options.data },
    destroyed = false,
    loaded = false,
    visible = true,
    paused = false,
    contextLost = false,
    selected = null;
  let renderer,
    model,
    mixer,
    loadController,
    animationFrame = 0,
    lastTime = 0,
    clockTime = 0,
    observer;
  let yaw = -0.08,
    targetYaw = -0.08,
    pitch = 0.04,
    targetPitch = 0.04,
    zoom = 1,
    lastTouch = 0,
    drag = null,
    pumpOn = false,
    waterEffect = null,
    waterTime = 0,
    dogActor = null,
    dogRunning = false,
    dogRunTime = 0,
    dogWaypoint = 0,
    dogTails = [],
    dogLegs = [];
  const dogPath = [
    [-1.55, 0.92],
    [-1.95, -0.15],
    [-1.35, -1.2],
    [-0.15, -1.62],
    [1.18, -1.35],
    [1.82, -0.35],
    [1.62, 0.82],
    [0.62, 1.48],
    [-0.72, 1.52],
  ];
  const raycaster = new T.Raycaster(),
    pointer = new T.Vector2(),
    interactions = [];
  const focusPoint = new T.Vector3(0, 1.9, 0),
    targetFocusPoint = focusPoint.clone();
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = media.matches;
  const root = node("div", "ea3d");
  root.dataset.quality = quality;
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", "Mô hình nông trại sầu riêng 3D");
  container.append(root);
  const fallback = node("div", "ea3d-fallback");
  if (opts.posterUrl) {
    const img = node("img", "ea3d-poster");
    img.src = opts.posterUrl;
    img.alt = "Mô hình sầu riêng EaAgri";
    fallback.append(img);
  }
  const status = node("p", "ea3d-status", "Đang chuẩn bị mô hình 3D…");
  status.setAttribute("role", "status");
  fallback.append(status);
  root.append(fallback);
  const canvas = node("canvas", "ea3d-canvas");
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    "Mô hình 3D. Phím mũi tên để xoay; + và - để thu phóng; Home để đặt lại.",
  );
  root.append(canvas);
  const scene = new T.Scene(),
    pivot = new T.Group();
  scene.add(pivot);
  const camera = new T.PerspectiveCamera(32, 1, 0.1, 80);
  camera.position.set(0, 4.8, 13);
  camera.lookAt(0, 1.9, 0);
  const ambient = new T.HemisphereLight(0xfff7dd, 0x344638, 1.7);
  scene.add(ambient);
  const sun = new T.DirectionalLight(0xffe2b0, 2.5);
  sun.position.set(-4, 9, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -6;
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const fill = new T.DirectionalLight(0xbfe8df, 1.05);
  fill.position.set(5, 4, 2);
  scene.add(fill);
  const rim = new T.DirectionalLight(0xfff0cf, 1.35);
  rim.position.set(0, 6, -5);
  scene.add(rim);

  const markers = node("div", "ea3d-markers"),
    pins = new Map();
  root.append(markers);
  HOTSPOT_IDS.forEach((id) => {
    const p = button(glyph[id], labels[id], () => select(id));
    p.className = "ea3d-pin";
    p.dataset.hotspot = id;
    p.setAttribute("aria-pressed", "false");
    p.title = labels[id];
    p.hidden = true;
    markers.append(p);
    pins.set(id, p);
  });
  const cards = node("div", "ea3d-cards");
  cards.hidden = true; // Wait for 3D model to load before showing the 4 cards
  root.append(cards);
  const cardValues = new Map();
  ["overview", "weather", "soil", "disease"].forEach((id) => {
    const b = button("", labels[id], () => select(id));
    b.className = `ea3d-card ea3d-card-${id}`;
    const title = node(
        "span",
        "ea3d-card-title",
        `${glyph[id]}  ${labels[id]}`,
      ),
      value = node("strong", "ea3d-card-value"),
      sub = node("span", "ea3d-card-sub");
    b.append(title, value, sub);
    cards.append(b);
    cardValues.set(id, { value, sub });
  });
  const details = node("section", "ea3d-details");
  details.hidden = true;
  details.setAttribute("aria-live", "polite");
  const close = button("×", "Đóng thông tin", () => {
    details.hidden = true;
    targetFocusPoint.set(0, 1.9, 0);
    zoom = 1;
    cards.querySelectorAll(".ea3d-card").forEach((card) => card.classList.remove("is-selected"));
    pins.forEach((el) => el.setAttribute("aria-pressed", "false"));
    requestRender();
    pins.get(selected)?.focus();
  });
  close.className = "ea3d-close";
  const detailTitle = node("h3"),
    detailText = node("p");
  details.append(close, detailTitle, detailText);
  root.append(details);
  const toolbar = node("div", "ea3d-toolbar");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Điều khiển mô hình");
  const resetBtn = button("↺", "Góc nhìn ban đầu", () => reset());
  const plusBtn = button("+", "Phóng to", () => {
    zoom = Math.min(1.25, zoom + 0.08);
    requestRender();
  });
  const minusBtn = button("−", "Thu nhỏ", () => {
    zoom = Math.max(0.82, zoom - 0.08);
    requestRender();
  });
  const pauseBtn = button("Ⅱ", "Tạm dừng chuyển động", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "▶" : "Ⅱ";
    pauseBtn.setAttribute(
      "aria-label",
      paused ? "Tiếp tục chuyển động" : "Tạm dừng chuyển động",
    );
    pauseBtn.setAttribute("aria-pressed", String(paused));
    requestRender();
  });
  toolbar.append(resetBtn, minusBtn, plusBtn, pauseBtn);
  root.append(toolbar);
  const hint = node("span", "ea3d-hint", "Kéo ngang để xoay · Chạm điểm sáng");
  root.append(hint);
  const source = node("span", "ea3d-source");
  root.append(source);
  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  function textFor(id) {
    if (data.source === "none")
      return "Chưa kết nối dữ liệu. Team dev có thể gắn sự kiện điểm chạm này vào chức năng hiện có của EaAgri.";
    const prefix = data.source === "demo" ? "Minh hoạ — " : "";
    const texts = {
      overview: `${data.treeName || "Cây sầu riêng"} · ${data.growthStage || "Chưa có giai đoạn sinh trưởng"}.`,
      soil: `Độ ẩm tầng nông ${valid(data.moistureTop, "%")}; tầng sâu ${valid(data.moistureDeep, "%")}.`,
      weather: `Nhiệt độ ${valid(data.temperature, "°C")}; lượng mưa dự báo ${valid(data.rainMm, " mm")}.`,
      disease:
        data.diseaseNote ||
        "Chưa có kết quả chẩn đoán. Không suy ra bệnh từ mô hình minh hoạ.",
      irrigation: `Máy bơm: ${data.pumpOn === true ? "đang bật" : data.pumpOn === false ? "đang tắt" : "chưa có dữ liệu"}. Thành phần này không gửi lệnh điều khiển thiết bị.`,
      assistant:
        "Điểm mở trợ lý EaAgri. Gắn onSelect vào cửa sổ chat của ứng dụng hiện tại.",
    };
    return prefix + texts[id];
  }
  function refreshData() {
    source.textContent =
      data.source === "live"
        ? "Dữ liệu do website cung cấp"
        : data.source === "demo"
          ? ""
          : "CHƯA KẾT NỐI DỮ LIỆU";
    cardValues.get("overview").value.textContent = data.treeName || "Sầu riêng";
    cardValues.get("overview").sub.textContent =
      data.growthStage || "Durio zibethinus";
    cardValues.get("soil").value.textContent = valid(data.moistureTop, "%");
    cardValues.get("soil").sub.textContent =
      `Tầng sâu ${valid(data.moistureDeep, "%")}`;
    cardValues.get("weather").value.textContent = valid(data.temperature, "°C");
    cardValues.get("weather").sub.textContent =
      `Mưa dự báo ${valid(data.rainMm, " mm")}`;
    cardValues.get("disease").value.textContent =
      data.source === "none" ? "Chưa kết nối" : "Chẩn đoán AI";
    cardValues.get("disease").sub.textContent =
      data.diseaseNote || "Chạm để mở chức năng";
    if (selected) detailText.textContent = textFor(selected);
  }
  function select(id) {
    if (!HOTSPOT_IDS.includes(id) || destroyed) return false;
    selected = id;
    detailTitle.textContent = labels[id];
    detailText.textContent = textFor(id);
    details.hidden = false;
    cards
      .querySelectorAll(".ea3d-card")
      .forEach((card) =>
        card.classList.toggle(
          "is-selected",
          card.classList.contains(`ea3d-card-${id}`),
        ),
      );
    const anchor = model?.getObjectByName(`Hotspot_${id}`);
    if (anchor) {
      const anchorPos = new T.Vector3();
      anchor.getWorldPosition(anchorPos);
      targetFocusPoint.set(anchorPos.x * 0.15, 1.9 + (anchorPos.y - 1.9) * 0.12, 0);
      zoom = 1.05;
      requestRender();
    }
    pins.forEach((el, key) =>
      el.setAttribute("aria-pressed", String(key === id)),
    );
    const detail = { id, label: labels[id], data: { ...data } };
    container.dispatchEvent(
      new CustomEvent("eaagri:select", { detail, bubbles: true }),
    );
    options.onSelect?.(detail);
    return true;
  }
  function reset() {
    targetYaw = -0.08;
    targetPitch = 0.04;
    zoom = 1;
    targetFocusPoint.set(0, 1.9, 0);
    requestRender();
  }
  function resize() {
    if (!renderer || destroyed) return;
    const w = Math.max(1, root.clientWidth),
      h = Math.max(1, root.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  function updateCamera() {
    // Generous bounding envelope so foliage and ground are never clipped.
    const vFov = (camera.fov * Math.PI) / 180,
      hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dist =
      Math.max(5.8 / Math.tan(hFov / 2), 5.4 / Math.tan(vFov / 2)) / zoom;
    focusPoint.lerp(targetFocusPoint, 0.14);
    camera.position.set(
      focusPoint.x,
      focusPoint.y + dist * 0.19,
      focusPoint.z + dist,
    );
    camera.lookAt(focusPoint);
    camera.updateMatrixWorld();
  }
  const worldPosition = new T.Vector3();
  const offsetVector = new T.Vector3();
  let lastCamKey = "";
  function updatePins(force = false) {
    if (!model) return;
    const camKey = `${pivot.rotation.x.toFixed(3)}_${pivot.rotation.y.toFixed(3)}_${camera.position.x.toFixed(2)}_${camera.position.y.toFixed(2)}_${camera.position.z.toFixed(2)}`;
    if (!force && camKey === lastCamKey) return;
    lastCamKey = camKey;

    model.updateMatrixWorld(true);
    pins.forEach((pin, id) => {
      const anchor = model.getObjectByName(`Hotspot_${id}`);
      if (
        !anchor ||
        !opts.showHotspots ||
        (id === "assistant" && !opts.showFarmer)
      ) {
        pin.hidden = true;
        return;
      }
      anchor.getWorldPosition(worldPosition);
      if (HOTSPOT_OFFSETS[id]) {
        offsetVector.copy(HOTSPOT_OFFSETS[id]).applyEuler(pivot.rotation);
        worldPosition.add(offsetVector);
      }
      worldPosition.project(camera);
      pin.hidden =
        worldPosition.z > 1 ||
        worldPosition.z < -1 ||
        Math.abs(worldPosition.x) > 1 ||
        Math.abs(worldPosition.y) > 1;
      pin.style.left = `${(worldPosition.x * 0.5 + 0.5) * 100}%`;
      pin.style.top = `${(-worldPosition.y * 0.5 + 0.5) * 100}%`;
    });
  }
  function canRender() {
    return !destroyed && loaded && visible && !document.hidden && !contextLost;
  }
  function requestRender() {
    if (canRender() && !animationFrame)
      animationFrame = requestAnimationFrame(frame);
  }
  function updateInteractions(dt) {
    for (let i = interactions.length - 1; i >= 0; i--) {
      const item = interactions[i];
      item.elapsed += dt;
      const progress = Math.min(1, item.elapsed / item.duration),
        smooth = progress * progress * (3 - 2 * progress);
      if (item.kind === "harvest") {
        item.object.scale.lerpVectors(
          item.fromScale,
          new T.Vector3(0.01, 0.01, 0.01),
          smooth,
        );
        if (progress === 1) {
          item.object.visible = false;
          interactions.splice(i, 1);
        }
      } else if (item.kind === "dog") {
        item.object.rotation.z =
          Math.sin(progress * Math.PI * 4) * 0.05 * (1 - progress);
        if (progress === 1) interactions.splice(i, 1);
      } else if (item.kind === "pump") {
        item.object.position.y =
          item.baseY +
          Math.sin(progress * Math.PI * 6) * 0.025 * (1 - progress);
        if (progress === 1) {
          item.object.position.y = item.baseY;
          interactions.splice(i, 1);
        }
      }
    }
  }
  function createWaterEffect() {
    const group = new T.Group();
    group.name = "WaterSpray";
    group.position.set(0, 0.14, 0);
    const material = new T.MeshStandardMaterial({
      color: 0x74d9f2,
      emissive: 0x1b7190,
      emissiveIntensity: 0.28,
      roughness: 0.18,
      metalness: 0.05,
      transparent: true,
      opacity: 0.78,
    });
    for (let i = 0; i < 16; i++) {
      const drop = new T.Mesh(
        new T.SphereGeometry(0.022 + (i % 3) * 0.006, 8, 6),
        material,
      );
      const angle = (i / 16) * Math.PI * 2;
      drop.userData = {
        offset: i * 0.17,
        angle,
        radius: 1.04 + (i % 3) * 0.04,
        height: 0.08 + (i % 4) * 0.035,
      };
      group.add(drop);
    }
    group.visible = false;
    model.add(group);
    waterEffect = group;
  }
  function updateWater(dt) {
    if (!waterEffect) return;
    waterTime += dt;
    waterEffect.visible = pumpOn;
    if (!pumpOn) return;
    waterEffect.children.forEach((drop) => {
      const data = drop.userData,
        phase = (waterTime + data.offset) % 1,
        angle = data.angle + waterTime * 0.08;
      drop.position.set(
        Math.cos(angle) * data.radius,
        data.height + Math.sin(phase * Math.PI) * 0.25,
        Math.sin(angle) * data.radius * 0.74,
      );
      drop.scale.setScalar(0.65 + 0.35 * Math.sin(phase * Math.PI));
    });
  }
  function updateDog(dt) {
    if (!dogActor || paused || reduced) return;
    dogRunTime += dt * (dogRunning ? 6 : 2.2);
    dogTails.forEach((tail) => {
      tail.rotation.z = Math.sin(dogRunTime) * 0.16;
    });
    if (!dogRunning) return;
    const target = dogPath[dogWaypoint],
      dx = target[0] - dogActor.position.x,
      dz = target[1] - dogActor.position.z,
      distance = Math.hypot(dx, dz);
    if (distance < 0.12) {
      dogWaypoint = (dogWaypoint + 1) % dogPath.length;
      return;
    }
    const speed = 0.72 * dt;
    dogActor.position.x += (dx / distance) * Math.min(speed, distance);
    dogActor.position.z += (dz / distance) * Math.min(speed, distance);
    dogActor.position.y = 0.1;
    dogActor.rotation.y = Math.atan2(dx, dz);
    dogLegs.forEach((leg, index) => {
      leg.rotation.x = Math.sin(dogRunTime + index * Math.PI) * 0.24;
    });
  }
  function frame(time) {
    animationFrame = 0;
    if (!canRender()) return;
    const dt = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0;
    lastTime = time;
    if (!paused && !reduced) {
      clockTime += dt;
      mixer?.update(dt);
      updateInteractions(dt);
      updateWater(dt);
      try {
        updateDog(dt);
      } catch (_) {}
    }
    if (
      opts.autoRotate &&
      !paused &&
      !reduced &&
      !drag &&
      time - lastTouch > 3000
    )
      targetYaw = Math.sin(clockTime * 0.15) * 0.2 - 0.08;
    yaw += (targetYaw - yaw) * 0.12;
    pitch += (targetPitch - pitch) * 0.12;
    pivot.rotation.set(pitch, yaw, 0);
    updateCamera();
    updatePins();
    renderer.render(scene, camera);
    if (
      (!paused && !reduced) ||
      Math.abs(targetYaw - yaw) > 0.0001 ||
      Math.abs(targetPitch - pitch) > 0.0001 ||
      focusPoint.distanceToSquared(targetFocusPoint) > 0.0001
    )
      requestRender();
  }
  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    lastTouch = performance.now();
    canvas.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    drag.moved =
      drag.moved ||
      Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6;
    targetYaw += dx * 0.005;
    targetPitch += dy * 0.005;
    drag.x = e.clientX;
    drag.y = e.clientY;
    lastTouch = performance.now();
    requestRender();
  }
  function interactAt(clientX, clientY) {
    if (!model || !renderer) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      (-(clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(model, true)[0];
    if (!hit) return;
    let object = hit.object;
    while (
      object &&
      object.parent &&
      object.parent !== model &&
      object.parent.name !== "DurianTree"
    )
      object = object.parent;
    if (object?.name?.startsWith("DurianFruit_")) {
      if (object.visible) {
        interactions.push({
          kind: "harvest",
          object,
          fromScale: object.scale.clone(),
          elapsed: 0,
          duration: 0.55,
        });
        detailTitle.textContent = "Đã hái sầu riêng";
        detailText.textContent = "Trái sầu riêng đã được thu hoạch khỏi cây.";
        details.hidden = false;
        requestRender();
      }
      return;
    }
    const dogObject = model.getObjectByName("Dog");
    if (
      (dogObject && hit.object === dogObject) ||
      dogObject?.getObjectById(hit.object.id)
    ) {
      dogRunning = !dogRunning;
      detailTitle.textContent = dogRunning
        ? "Chú chó bắt đầu chạy"
        : "Chú chó đã dừng";
      detailText.textContent = dogRunning
        ? "Chú chó chạy quanh gốc cây theo đường tự nhiên."
        : "Chạm lại để cho chó chạy tiếp.";
      details.hidden = false;
      requestRender();
      return;
    }
    const pump = model.getObjectByName("PumpInteraction");
    if (pump && hit.object === pump) {
      pumpOn = !pumpOn;
      const equipment = model.getObjectByName("IoT");
      if (equipment)
        interactions.push({
          kind: "pump",
          object: equipment,
          baseY: equipment.position.y,
          elapsed: 0,
          duration: 0.7,
        });
      detailTitle.textContent = pumpOn ? "Đã bật tưới" : "Đã tắt tưới";
      detailText.textContent = pumpOn
        ? "Máy bơm đang hoạt động."
        : "Máy bơm đã dừng.";
      details.hidden = false;
      requestRender();
    }
  }
  function onPointerEnd(e) {
    if (e.pointerId !== drag?.id) return;
    const wasTap = !drag.moved;
    drag = null;
    if (wasTap) interactAt(e.clientX, e.clientY);
    if (canvas.hasPointerCapture(e.pointerId))
      canvas.releasePointerCapture(e.pointerId);
  }
  function onKey(e) {
    if (e.key === "ArrowLeft") targetYaw -= 0.08;
    else if (e.key === "ArrowRight") targetYaw += 0.08;
    else if (e.key === "ArrowUp") targetPitch -= 0.08;
    else if (e.key === "ArrowDown") targetPitch += 0.08;
    else if (e.key === "+" || e.key === "=") zoom = Math.min(1.25, zoom + 0.08);
    else if (e.key === "-") zoom = Math.max(0.82, zoom - 0.08);
    else if (e.key === "Home") reset();
    else return;
    e.preventDefault();
    lastTouch = performance.now();
    requestRender();
  }
  function onContextLost(e) {
    e.preventDefault();
    contextLost = true;
    fallback.hidden = false;
    status.textContent = "Tạm ngừng hiển thị 3D. Bạn có thể tải lại trang.";
    pins.forEach((p) => (p.hidden = true));
  }
  function onContextRestored() {
    contextLost = false;
    fallback.hidden = true;
    lastTime = 0;
    requestRender();
  }
  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastTime = 0;
    } else requestRender();
  }
  function onMotion(e) {
    reduced = e.matches;
    requestRender();
  }
  const handlers = [
    ["pointerdown", onPointerDown],
    ["pointermove", onPointerMove],
    ["pointerup", onPointerEnd],
    ["pointercancel", onPointerEnd],
    ["keydown", onKey],
    ["webglcontextlost", onContextLost],
    ["webglcontextrestored", onContextRestored],
  ];
  handlers.forEach(([type, fn]) => canvas.addEventListener(type, fn));
  document.addEventListener("visibilitychange", onVisibility);
  media.addEventListener("change", onMotion);

  async function load() {
    if (loadController || destroyed) return;
    loadController = new AbortController();
    try {
      renderer = new T.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: (window.devicePixelRatio || 1) <= 1.5,
        powerPreference: "high-performance",
        precision: "mediump",
      });
      // Disable heavy dynamic shadow maps on auto/mobile to boost FPS 3x
      renderer.shadowMap.enabled = opts.quality === "high";
      if (renderer.shadowMap.enabled) {
        renderer.shadowMap.type = T.PCFShadowMap;
      }
      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio || 1,
          quality === "mobile" ? 1.25 : opts.maxDpr,
        ),
      );
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      const response = await fetch(options.modelUrl || new URL(file, base), {
        signal: loadController.signal,
        priority: "high",
      });
      if (!response.ok) throw Error(`Model request ${response.status}`);
      const gltf = await new GLTFLoader().parseAsync(
        await response.arrayBuffer(),
        base.href,
      );
      if (destroyed) {
        disposeModel(gltf.scene);
        return;
      }
      model = gltf.scene;
      pivot.add(model);
      if (renderer.shadowMap.enabled) {
        model.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
      }
      dogActor = model.getObjectByName("Dog");
      if (dogActor) {
        dogTails = dogActor.children.filter((child) => child.name.startsWith("DogTail"));
        dogLegs = dogActor.children.filter((child) => child.name.startsWith("DogLeg"));
      }
      model
        .getObjectByName("Farmer")
        ?.traverse((o) => (o.visible = opts.showFarmer));
      createWaterEffect();
      mixer = new T.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
      loaded = true;
      root.dataset.state = "ready";
      fallback.hidden = true;
      resize();
      refreshData();
      resolveReady({ ok: true, quality });
      options.onReady?.({ quality });
      requestRender();

      // Khi 3D đã load và render xong -> hiện 4 thẻ chữ với hiệu ứng mượt mà
      if (opts.showCards) {
        setTimeout(() => {
          if (!destroyed) {
            cards.hidden = false;
            cards.classList.add("ea3d-cards--visible");
          }
        }, 120);
      }
    } catch (error) {
      if (destroyed) return;
      root.dataset.state = "error";
      canvas.hidden = true;
      markers.hidden = true;
      if (opts.showCards) {
        cards.hidden = false;
        cards.classList.add("ea3d-cards--visible");
      }
      status.textContent =
        "Không thể hiển thị 3D trên thiết bị này. Hình dự phòng vẫn được giữ lại.";
      options.onError?.(error);
      resolveReady({ ok: false, error });
    }
  }
  observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        load();
        lastTime = 0;
        requestRender();
      } else {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        lastTime = 0;
      }
    },
    { rootMargin: "120px" },
  );
  observer.observe(root);
  if (!opts.lazy) load();
  refreshData();
  function disposeModel(object) {
    const geos = new Set(),
      mats = new Set();
    object?.traverse((o) => {
      if (o.geometry) geos.add(o.geometry);
      if (o.material)
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
          mats.add(m),
        );
    });
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => {
      Object.values(m).forEach((v) => {
        if (v?.isTexture) v.dispose();
      });
      m.dispose();
    });
  }
  const api = {
    ready,
    setData(next) {
      if (destroyed) return;
      data = { ...data, ...next };
      refreshData();
    },
    select,
    reset,
    setPaused(value) {
      paused = Boolean(value);
      pauseBtn.textContent = paused ? "▶" : "Ⅱ";
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.setAttribute(
        "aria-label",
        paused ? "Tiếp tục chuyển động" : "Tạm dừng chuyển động",
      );
      requestRender();
    },
    setCardsVisible(value) {
      cards.hidden = !value;
      if (value) cards.classList.add("ea3d-cards--visible");
    },
    getStats() {
      return {
        loaded,
        quality,
        drawCalls: renderer?.info.render.calls ?? 0,
        triangles: renderer?.info.render.triangles ?? 0,
        paused,
        reducedMotion: reduced,
      };
    },
    async capture({ width = 1600, height = 1400 } = {}) {
      if (!loaded || destroyed) throw Error("Wait for ready before capture");
      width = Math.max(128, Math.min(2400, width));
      height = Math.max(128, Math.min(2400, height));
      const size = renderer.getSize(new T.Vector2()),
        pixelRatio = renderer.getPixelRatio(),
        aspect = camera.aspect;
      renderer.setPixelRatio(1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      updateCamera();
      renderer.render(scene, camera);
      const url = canvas.toDataURL("image/png");
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(size.x, size.y, false);
      requestRender();
      const binary = atob(url.split(",")[1]),
        bytes = new Uint8Array(binary.length);
      for (let i = 0; i < bytes.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: "image/png" });
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      loadController?.abort();
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      resizeObserver.disconnect();
      handlers.forEach(([type, fn]) => canvas.removeEventListener(type, fn));
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMotion);
      mixer?.stopAllAction();
      if (model) mixer?.uncacheRoot(model);
      disposeModel(model);
      renderer?.dispose();
      root.remove();
      active.delete(container);
      resolveReady({ ok: false, reason: "destroyed" });
    },
  };
  active.set(container, api);
  return api;
}
