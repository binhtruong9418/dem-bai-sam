# 🧧 Đếm Bài Sâm

Mini web app ghi chú tiền thắng/thua khi chơi bài Sâm dịp Tết. Giao diện mobile-first, theme đỏ-vàng Tết, dữ liệu lưu trên localStorage.

## Tính năng

### Core
- **Quản lý cuộc chơi** — Tạo, xóa, kết thúc cuộc chơi. Xem lại cuộc chơi đã kết thúc
- **Quản lý người chơi** — Thêm/xóa người chơi trong cuộc chơi
- **Nhập điểm** — Gõ số hoặc dùng nút +/- (mỗi lần ±10). Ghi điểm cập nhật tổng ngay
- **Hoàn tác** — Undo lần nhập cuối cho từng người chơi
- **Lịch sử biểu thức** — Hiển thị dạng phép tính: `10 + 20 - 5 = 25`
- **Xếp hạng** — Tự động sắp xếp theo tổng tiền, badge 👑 cho người đứng đầu

### Nâng cao
- **Avatar emoji Tết** — Mỗi người chơi có avatar từ bộ emoji 12 con giáp + Tết (🐉🧧🏮...). Bấm avatar để đổi
- **Chia sẻ QR** — Tạo QR code + link chia sẻ kết quả. Copy kết quả dạng text hoặc link
- **Hiệu ứng & âm thanh** — Confetti khi kết thúc game, pulse/shake khi ghi điểm, score fly-up animation. Âm thanh Web Audio API (toggle bật/tắt)
- **Thống kê** — Biểu đồ đường tiền tích lũy theo thời gian. Stats chi tiết: thắng/thua, %, streak 🔥💀, tốt nhất/tệ nhất

## Tech stack

- **React 19** + **TypeScript**
- **Vite 7** — dev server + build
- **recharts** — biểu đồ
- **qrcode.react** — QR code
- **Web Audio API** — âm thanh (không cần file mp3)
- **localStorage** — persistence

## Cấu trúc project

```
src/
├── types.ts                 # Types, interfaces, constants
├── utils.ts                 # Helper functions (format, stats, share, chart)
├── sounds.ts                # Web Audio API sound effects
├── components/
│   ├── Confetti.tsx          # Confetti animation overlay
│   ├── Dialogs.tsx           # All dialog components (NewGame, Confirm, Avatar, Share)
│   ├── GameCard.tsx          # Game card in home list
│   ├── PlayerSummary.tsx     # Player summary with rank, expression, stats
│   ├── ScoreEntry.tsx        # Score input form
│   └── StatsSection.tsx      # Chart + stats detail section
├── App.tsx                   # Main app (state management + routing)
├── App.css                   # All component styles
├── index.css                 # Global styles, CSS variables, theme
└── main.tsx                  # Entry point
```

## Chạy project

```bash
# Cài dependencies
yarn install

# Dev server (http://localhost:5173)
yarn dev

# Build production
yarn build

# Preview production build
yarn preview
```

## Data storage

Tất cả dữ liệu lưu trong `localStorage`:

| Key | Mô tả |
|-----|--------|
| `sam_games` | Mảng `GameSession[]` — tất cả cuộc chơi |
| `sam_sound` | `"true"` / `"false"` — toggle âm thanh |

## Chia sẻ cuộc chơi

Khi bấm "Chia sẻ", app tạo URL chứa dữ liệu cuộc chơi encode base64 dạng `?game=...`. Người nhận mở link sẽ thấy kết quả cuộc chơi ở chế độ review.
