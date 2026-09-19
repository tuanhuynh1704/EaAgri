# EaAgri — Bộ mô hình sầu riêng 3D, bản 2

Gói bàn giao độc lập để team dev thay hình minh hoạ ở cột bên trái phần đầu trang eaagri.vn. Không cần đổi toàn bộ website, không phụ thuộc vào bản demo Sites trước đó. Không có thay đổi nào được triển khai lên website hiện tại trong lần bàn giao này.

## Mở xem ngay

Giải nén, mở `preview-offline.html` bằng Chrome, Edge hoặc Firefox hiện đại. Tệp này chứa mô hình thật bên trong và không cần npm/CDN. Đây là bản xem trước, không phải tệp nên đưa nguyên khối lên trang chủ.

Nếu trình duyệt/chính sách doanh nghiệp không cho mở ES module từ tệp, chạy:

```bash
npm ci
npm run dev
```

Mở `http://localhost:4173`. Chọn **Chi tiết / Bản nhẹ**, kéo ngang để xoay, dùng +/− để zoom, chạm các điểm sáng, thử **Khung điện thoại** và tắt **Bảng dữ liệu / Nhân vật**. Các số liệu trong demo được ghi rõ là minh hoạ.

## Có gì trong gói?

| Tệp | Công dụng |
| --- | --- |
| `assets/eaagri-durian-high.glb` | Cảnh đầy đủ, chi tiết cao, cho máy tính |
| `assets/eaagri-durian-mobile.glb` | Cảnh nhẹ hơn, ít lá và gai hơn |
| `assets/durian-tree-only.glb` | Chỉ cây, thuận tiện nhập vào Blender hoặc scene riêng |
| `assets/poster.png` | Ảnh PNG nền trong suốt, dựng từ chính mô hình; dùng dự phòng |
| `assets/model-manifest.json` | Dung lượng, số tam giác, vật liệu, tên chuyển động và điểm chạm |
| `assets/validation-report.json` | Kết quả kiểm tra bằng Khronos glTF-Validator |
| `dist/eaagri-3d.js`, `dist/eaagri-3d.css` | Bộ nhúng đã đóng gói, Three.js đi kèm; tự host, không cần CDN |
| `src/model-factory.mjs` | Mã nguồn dựng cây, trái, đảo, thiết bị, nhân vật; tái xuất GLB được |
| `src/viewer.mjs`, `src/viewer.css` | Mã nguồn bộ hiển thị và tương tác |
| `examples/EaAgriDurian.tsx` | Ví dụ component React/Next.js |
| `examples/EaAgriDurian.vue` | Ví dụ component Vue |
| `examples/plain-html.html` | Ví dụ HTML/JS thuần |

Mô hình gồm: lá dài nhọn có độ cong, mặt trên xanh / mặt dưới ngả nâu đồng, thân và rễ có gờ vân, cành ngang phân tầng, **10 trái sầu riêng có gai và cuống**, đảo đất với đá/cỏ, hệ thống nhỏ giọt, bơm, cảm biến đất, camera, pin mặt trời, trạm thời tiết, nhân vật nông dân. Không có ảnh cây dán lên một mặt phẳng để giả 3D.

Đây là **mô hình dựng bằng thủ tục, phong cách bán hiện thực**, không phải bản quét thực vật hay bản sao chính xác ảnh tham khảo. Nhân vật và địa hình vẫn được cách điệu. Không mô phỏng sinh học, bệnh cây hay thiết bị thật.

## Cách 1 — Nhúng nhanh, không thay bộ công nghệ hiện tại

Copy hai thư mục `dist/` và `assets/` vào `public/eaagri-3d/` của website. Không copy `node_modules/`, scripts dựng hay `preview-offline.html` vào trang chủ.

Thay **chỉ vùng hình minh hoạ bên trái** bằng một khung có chiều cao rõ ràng. Giữ nguyên logo gốc, nền trời/núi, tiêu đề, nút tải ứng dụng và điều hướng. Bộ này không vẽ lại hoặc đính kèm logo EaAgri.

```html
<link rel="stylesheet" href="/eaagri-3d/dist/eaagri-3d.css">
<div id="eaagri-farm" style="width:100%;height:clamp(400px,44vw,680px)"></div>
<script type="module">
  import { createEaAgriScene } from '/eaagri-3d/dist/eaagri-3d.js';

  const farm = createEaAgriScene(document.querySelector('#eaagri-farm'), {
    assetBaseUrl: '/eaagri-3d/assets/', // Có dấu / cuối.
    posterUrl: '/eaagri-3d/assets/poster.png',
    quality: 'auto',
    showCards: true,
    showFarmer: true,
    onSelect: ({ id }) => {
      // Nối vào router/modal/chat HIỆN CÓ của website.
      // Ví dụ: if (id === 'disease') openExistingDiagnosisModal();
      console.log('eaagri:select', id);
    },
    onError: error => console.warn('EaAgri 3D fallback', error),
  });

  // Chỉ truyền dữ liệu đã lấy từ API của website.
  // Không dùng source:'live' cho số liệu tự tạo.
  // farm.setData({source:'live',moistureTop:soil.top,moistureDeep:soil.deep});

  // Với SPA: bắt buộc gọi farm.destroy() khi rời trang/unmount.
</script>
```

Bản `dist` đã chứa Three.js. Nếu ứng dụng đã sử dụng Three.js, nên import `src/viewer.mjs` bằng bundler và dùng chung dependency, tránh tải thư viện hai lần. Source trong gói dùng `three@0.186.0` (đã khoá version). Nếu website dùng version khác, team cần kiểm tra tương thích trước khi nâng cấp.

## Cách 2 — React / Next.js hoặc Vue

Copy `src/viewer.mjs`, `src/viewer.d.mts`, `src/viewer.css` vào thư mục component của ứng dụng; copy `assets/` vào `public/eaagri-3d/assets/`.

Tham khảo component tương ứng trong `examples/`, chỉnh lại import theo vị trí đặt tệp. Ví dụ React đã xử lý mount/unmount, cập nhật callback không dựng lại scene, cập nhật data và dọn tài nguyên. Với SSR, chỉ mount trong `useEffect`/`onMounted`; không gọi renderer ở server.

```tsx
<EaAgriDurian
  assetBaseUrl="/eaagri-3d/assets/"
  quality="auto"
  data={{source:'none'}}
  onSelect={({id}) => {
    // Nối id vào chức năng phù hợp của ứng dụng.
  }}
/>
```

Không cần cài React Three Fiber. Không có backend, key API, tài khoản, cookie, analytics, Firebase config hay quyền admin trong gói.

## Điểm tương tác và dữ liệu

| `id` / node GLB | Nối vào chức năng hiện có |
| --- | --- |
| `overview` / `Hotspot_overview` | Thông tin cây / nhật ký mùa vụ |
| `soil` / `Hotspot_soil` | Cảm biến tầng nông và tầng sâu |
| `weather` / `Hotspot_weather` | Dự báo thời tiết |
| `disease` / `Hotspot_disease` | Chẩn đoán bệnh từ ảnh |
| `irrigation` / `Hotspot_irrigation` | Bảng tưới — không tự bật/tắt thiết bị |
| `assistant` / `Hotspot_assistant` | Mở trợ lý AI |

`onSelect({id,label,data})` và DOM event `eaagri:select` trên container cùng được phát. Chọn **một** cách để tránh xử lý hai lần. Nhãn/bảng chữ là HTML tiếng Việt, không bị ghi cứng trong mesh. Các điểm chạm được chiếu từ vị trí 3D sang HTML và vẫn có thể dùng bàn phím.

`setData()` cập nhật từng phần: `source` (`none`, `demo`, `live`), `treeName`, `growthStage`, `moistureTop`, `moistureDeep`, `temperature`, `rainMm`, `pumpOn`, `diseaseNote`. Giá trị chưa có hiển thị “—”. Tất cả chuỗi được gán bằng `textContent`, không render HTML từ dữ liệu.

API thêm: `ready` (Promise có `{ok,quality}`), `select(id)`, `reset()`, `setPaused(boolean)`, `setCardsVisible(boolean)`, `getStats()`, `capture({width,height})` → Blob PNG trong suốt, `destroy()`. Xem kiểu dữ liệu tại `src/viewer.d.mts`.

## Dùng riêng GLB trong Blender / Three.js

Blender: **File → Import → glTF 2.0**, chọn GLB. Cấu trúc có `DurianTree`, `Island`, `IoT`, `Farmer`, các cụm `Canopy_*`, `DurianFruit_*` và `Hotspot_*`. Bản tree-only vẫn có anchor để tích hợp, nhưng không có thiết bị/nhân vật.

Đơn vị thiết kế là mét; trục Y hướng lên, hướng nhìn mặc định từ +Z. Màu được lưu bằng **vertex color COLOR_0 và vật liệu PBR**. Khi chỉnh shader trong Blender, phải giữ/đọc vertex color, nếu không mô hình sẽ trắng. Không có texture ngoài bị thiếu. Cụm lá và gai đã gộp theo vật liệu để giảm số lượt vẽ; từng chiếc lá/gai không phải object riêng.

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const gltf = await new GLTFLoader().loadAsync('/eaagri-3d/assets/durian-tree-only.glb');
scene.add(gltf.scene);
const mixer = new THREE.AnimationMixer(gltf.scene);
gltf.animations.forEach(clip => mixer.clipAction(clip).play());
// Trong vòng lặp của ứng dụng: mixer.update(deltaSeconds).
```

Chuyển động `Gentle_Breeze` dài 8 giây, lặp lại, gồm cụm lá và quả lắc nhẹ. Ánh sáng/camera/giao diện được cấu hình tại bộ nhúng, không ghi cứng vào GLB. Đây là GLB tiêu chuẩn chưa nén Draco/Meshopt, thuận tiện chỉnh sửa và không cần decoder ngoài.

## Hiệu năng, hành vi và giới hạn

- Bản chi tiết khoảng **11,25 MB / 228.010 tam giác**; bản nhẹ khoảng **4,28 MB / 82.082 tam giác** trước nén HTTP. Số chính xác nằm trong manifest; đây không phải cam kết FPS.
- `quality:'auto'` chọn bản nhẹ ở màn hình nhỏ hoặc khi trình duyệt báo bộ nhớ ≤4 GB. Có thể ép `mobile` cho toàn bộ điện thoại. Dùng `maxDpr` để giảm tải màn hình mật độ cao.
- Chỉ tải GLB khi vùng hiển thị gần viewport; dừng vẽ khi tab bị ẩn hoặc vùng hiển thị ra ngoài màn hình. Có nút dừng chuyển động và tôn trọng `prefers-reduced-motion`.
- Góc xoay bị giới hạn để giữ bố cục trang chủ. Không chặn cuộn con lăn trang; zoom qua nút +/− hoặc bàn phím. Chạm vuốt dọc vẫn dành cho cuộn trang, kéo ngang dành cho xoay.
- CSS nằm dưới `.ea3d`, không sửa `body`/nút/tiêu đề của website. Canvas trong suốt. Nhân vật có thể ẩn bằng `showFarmer:false`.
- Bộ nhúng không tự chẩn đoán bệnh, không gọi LLM và **không điều khiển máy bơm**. Team dev chịu trách nhiệm kết nối API, xác thực, phân quyền và xác nhận cho các lệnh thật.
- Cần WebGL 2. Nếu WebGL/tải mô hình lỗi, giữ poster và thông báo; ứng dụng chính vẫn hoạt động.
- Không có dữ liệu hay chức năng thật nào từ website eaagri.vn được sao chép vào gói. Chỉ đối chiếu bố cục với ảnh người dùng gửi và HTML công khai.

## Kiểm tra đã làm và phần team dev cần làm tiếp

Đã kiểm tra cú pháp JS, đóng gói ES module, xuất 3 GLB và kiểm tra bằng Khronos glTF-Validator (không lỗi/cảnh báo tại thời điểm xuất), kiểm tra node/clip/màu và dựng poster từ GLB bằng bộ dựng 3D độc lập.

**Chưa hoàn tất kiểm thử tương tác trên trình duyệt:** môi trường kiểm tra từ xa không truy cập được server cục bộ và không cho mở `file://`. Không tuyên bố đã kiểm chứng FPS, Safari iOS, Android hay tích hợp production. Team dev cần:

1. Mở demo bằng HTTP và kiểm tra kéo/zoom/6 điểm chạm, hiển thị hai mức chất lượng, pause/reset và cập nhật data.
2. Kiểm tra chiều cao container, responsive 360/390/768/1440 px; giữ mô hình nằm ở vùng hình trái, không che CTA.
3. Kiểm tra Safari/iOS, Chrome/Android máy yếu, thiết bị không hỗ trợ WebGL và mạng chậm. Xác nhận cuộn trang không bị giữ.
4. Kiểm tra unmount/mount nhiều lần không tăng WebGL context/GPU memory; kiểm tra Reduced Motion và bàn phím.
5. Bật gzip/Brotli phù hợp; cấu hình MIME `.glb` là `model/gltf-binary`; cache theo version/hash. Nếu dùng CDN khác origin, bật CORS đúng domain.
6. CSP cho phép module/asset của chính domain; không thêm `unsafe-eval`. Dùng bản `dist` + asset rời cho production, không bản offline chứa script inline.
7. Thử trên staging rồi mới thay hình của website chính. Giữ ảnh cũ làm đường lui.

## Sửa mô hình và tái xuất

```bash
npm ci
npm run models
npm run build
npm run validate
npm run dev
```

Chỉnh `src/model-factory.mjs`: `durianTree()` cho cành/lá/vị trí quả, `durianFruit()` cho gai, `terrain()` cho đảo, `equipment()` cho IoT, `farmer()` cho nhân vật. Khi đổi vị trí, cập nhật `anchors`. `scripts/render-preview.py` là bước tuỳ chọn để dựng lại poster bằng Python + EGL; bộ nhúng web không cần Python.

Thư viện Three.js giữ giấy phép MIT ở `licenses/THREE-MIT.txt`. Các mô hình được dựng mới từ mã nguồn thủ tục trong gói, không dùng mô hình thương mại tải về hay hình cây làm texture. Gói này phục vụ việc team EaAgri chỉnh sửa và tích hợp; không chứa logo do AI vẽ lại.

Tài liệu tham khảo: [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [GLTFExporter](https://threejs.org/docs/pages/GLTFExporter.html), [Khronos glTF-Validator](https://github.com/KhronosGroup/glTF-Validator). Trang đối chiếu: [EaAgri](https://www.eaagri.vn/).
