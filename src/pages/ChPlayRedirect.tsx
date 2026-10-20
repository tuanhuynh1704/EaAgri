import { useEffect } from "react";

const CH_PLAY_URL = "https://play.google.com/store/apps/details?id=com.eaagri.app";

export default function ChPlayRedirect() {
  useEffect(() => {
    // Tự động chuyển tiếp thẳng đến Google Play Store của EaAgri
    window.location.replace(CH_PLAY_URL);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#070f0b",
        color: "#22c55e",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          border: "3px solid rgba(34, 197, 94, 0.2)",
          borderTopColor: "#22c55e",
          borderRadius: "50%",
          animation: "eaagriSpin 0.8s linear infinite",
          marginBottom: "18px",
        }}
      />
      <p
        style={{
          color: "#f0fdf4",
          fontSize: "1.1rem",
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        Đang tự động chuyển tiếp đến Google Play (CH Play)...
      </p>
      <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
        Nếu trình duyệt không tự chuyển, vui lòng{" "}
        <a
          href={CH_PLAY_URL}
          style={{ color: "#22c55e", textDecoration: "underline" }}
        >
          bấm vào đây
        </a>
        .
      </p>
      <style>{`
        @keyframes eaagriSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
