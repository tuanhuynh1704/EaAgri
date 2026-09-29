import { useEffect, Suspense } from "react";
import "./styles/main.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import FloatingVoteWidget from "./components/FloatingVoteWidget";
import VoteAnnouncementBar from "./components/VoteAnnouncementBar";
import AppStoreNoticeModal from "./components/AppStoreNoticeModal";
import PromoVideoModal from "./components/PromoVideoModal";
import { AuthProvider } from "./context/AuthContext";
import { usePauseOffscreenAnimations } from "./hooks/usePauseOffscreenAnimations";
import { recordVisitorHit } from "./services/visitorTracker";

function RouteFallback() {
  return (
    <div className="route-page-loader" aria-busy="true" aria-label="Đang tải trang...">
      <div className="route-page-loader__spinner" />
    </div>
  );
}

function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname.startsWith("/admin");

  usePauseOffscreenAnimations();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    // Track visitor hit for this machine / IP (skip tracking admin dashboard itself)
    if (!isAdminPage) {
      recordVisitorHit(pathname);
    }
  }, [pathname, isAdminPage]);

  useEffect(() => {
    AOS.init({
      duration: 500,
      once: true,
      offset: 50,
      easing: "ease-out-cubic",
    });
    AOS.refresh();
  }, []);

  return (
    <AuthProvider>
      {!isAuthPage && !isAdminPage && <VoteAnnouncementBar />}
      {!isAuthPage && <Navbar />}
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
      {!isAuthPage && !isAdminPage && <Footer />}
      {!isAuthPage && !isAdminPage && <FloatingContact />}
      {!isAuthPage && !isAdminPage && <FloatingVoteWidget />}
      <AppStoreNoticeModal />
      <PromoVideoModal />
    </AuthProvider>
  );
}

export default App;
