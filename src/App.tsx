import { useEffect, Suspense } from "react";
import "./styles/main.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import FloatingVoteWidget from "./components/FloatingVoteWidget";
import FloatingTrafficWidget from "./components/FloatingTrafficWidget";
// import VoteAnnouncementBar from "./components/VoteAnnouncementBar";
import AppStoreNoticeModal from "./components/AppStoreNoticeModal";
import PromoVideoModal from "./components/PromoVideoModal";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { VoteProvider } from "./context/VoteContext";
import { usePauseOffscreenAnimations } from "./hooks/usePauseOffscreenAnimations";
import {
  recordVisitorHit,
  sendVisitorHeartbeat,
  sendVisitorLeave,
} from "./services/visitorTracker";

function RouteFallback() {
  return (
    <div className="route-page-loader" aria-busy="true" aria-label="Đang tải trang...">
      <div className="route-page-loader__spinner" />
    </div>
  );
}

function VisitorTracker() {
  const { pathname } = useLocation();
  const { user, profile } = useAuth();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Track visitor hit for this machine / IP
    recordVisitorHit(pathname, {
      isAuthenticated: Boolean(user),
      userId: user?.id,
      userEmail: user?.email,
      userName:
        profile?.full_name ||
        (user?.user_metadata as any)?.full_name ||
        (user?.email ? user.email.split("@")[0] : undefined),
      userRole:
        profile?.role ||
        (user?.app_metadata as any)?.role ||
        (user ? "user" : undefined),
    });
  }, [pathname, user, profile]);

  // Realtime Heartbeat (every 15s) and Instant Leave Listener (pagehide & beforeunload)
  useEffect(() => {
    // Send immediate heartbeat on mount
    sendVisitorHeartbeat(window.location.pathname);

    // Periodic heartbeat every 15s to maintain active online status
    const interval = setInterval(() => {
      sendVisitorHeartbeat(window.location.pathname);
    }, 15000);

    // Instant leave notification when tab/window closes or navigates away
    const handleLeave = () => {
      sendVisitorLeave();
    };

    window.addEventListener("pagehide", handleLeave);
    window.addEventListener("beforeunload", handleLeave);

    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", handleLeave);
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, []);

  return null;
}

function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname.startsWith("/admin");

  usePauseOffscreenAnimations();

  useEffect(() => {
    AOS.init({
      duration: 350, // Giảm 30% thời lượng (500ms -> 350ms) giúp chuyển động dứt khoát, thanh thoát
      once: true,
      offset: 35, // Giảm ngưỡng cuộn kích hoạt
      easing: "ease-out-cubic",
    });
    AOS.refresh();
  }, []);

  return (
    <AuthProvider>
      <VoteProvider>
        <VisitorTracker />
        {/* {!isAuthPage && !isAdminPage && <VoteAnnouncementBar />} */}
        {!isAuthPage && <Navbar />}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
        {!isAuthPage && !isAdminPage && <Footer />}
        {!isAuthPage && !isAdminPage && <FloatingContact />}
        {!isAuthPage && !isAdminPage && <FloatingVoteWidget />}
        {!isAuthPage && !isAdminPage && <FloatingTrafficWidget />}
        <AppStoreNoticeModal />
        <PromoVideoModal />
      </VoteProvider>
    </AuthProvider>
  );
}

export default App;
