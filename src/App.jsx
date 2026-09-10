import { useState } from 'react'
import Header from './header.jsx'
import Home from './Home.jsx'
import Footer from './footer.jsx';
import ContentGenerationFlow from './ContentGenerationFlow.jsx';
import ContentGenerationInstagram from './ContentGenerationInstagram.jsx';
import ContentGenerationSnapchat from './ContentGenerationSnapchat.jsx';
import ContentGenerationYouTube from './ContentGenerationYouTube.jsx';
import ContentGenerationTikTok from './ContentGenerationTikTok.jsx';
import ContentGenerationPinterest from './ContentGenerationPinterest.jsx';
import CreatePage from './contentlab/CreatePage.jsx';
import UserAccountMgnt from './UserAccountMgnt.jsx';
import AnalyticsDashboard from './analytics/AnalyticsDashboard.jsx';
import AIChatPage from './analytics/AIChatPage.jsx';
import CalendarPage from './tools/CalendarPage.jsx';
import CommentsPage from './tools/CommentsPage.jsx';
import TrendsPage from './tools/TrendsPage.jsx';
import PlanPage from './tools/PlanPage.jsx';
import BoardPage from './tools/BoardPage.jsx';
import DemoPage from './DemoPage.jsx';
import { CreatorProvider } from './analytics/CreatorContext.jsx';
import Login from './login.jsx';
import Register from './register.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import ResetPassword from './ResetPassword.jsx';
import NotFound from './components/NotFound.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import TermsOfService from './components/TermsOfService.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PageTransition from './components/PageTransition.jsx';
import Onboarding from './components/Onboarding.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import ConnectAccountGate from './components/ConnectAccountGate.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public layout — marketing/auth pages with top header + footer
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("maya-onboarded");
  });

  return (
    <Router>
      <CreatorProvider>
        <ErrorBoundary>
          <ToastContainer position="top-right" autoClose={4000} />
          {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

          <Routes>
            {/* Demo page — standalone, no header/footer */}
            <Route path="/demo" element={<DemoPage />} />

            {/* Public pages — top header + footer */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><TermsOfService /></PublicLayout>} />

            {/* Authenticated app — dashboard shell (sidebar + top bar) */}
            <Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
              <Route path="/plan" element={<ConnectAccountGate><PlanPage /></ConnectAccountGate>} />
              <Route path="/calendar" element={<ConnectAccountGate><CalendarPage /></ConnectAccountGate>} />
              <Route path="/board" element={<ConnectAccountGate><BoardPage /></ConnectAccountGate>} />
              <Route path="/analytics" element={<ConnectAccountGate><AnalyticsDashboard /></ConnectAccountGate>} />
              <Route path="/chat" element={<ConnectAccountGate><AIChatPage /></ConnectAccountGate>} />
              <Route path="/comments" element={<ConnectAccountGate><CommentsPage /></ConnectAccountGate>} />
              <Route path="/trends" element={<ConnectAccountGate><TrendsPage /></ConnectAccountGate>} />
              {/* No connected account required */}
              <Route path="/create" element={<CreatePage />} />
              <Route path="/UserAccountMgnt" element={<UserAccountMgnt />} />
              <Route path="/ContentGenerationFlow" element={<ContentGenerationFlow />} />
              <Route path="/ContentGenerationInstagram" element={<ContentGenerationInstagram />} />
              <Route path="/ContentGenerationSnapchat" element={<ContentGenerationSnapchat />} />
              <Route path="/ContentGenerationYouTube" element={<ContentGenerationYouTube />} />
              <Route path="/ContentGenerationTikTok" element={<ContentGenerationTikTok />} />
              <Route path="/ContentGenerationPinterest" element={<ContentGenerationPinterest />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </ErrorBoundary>
      </CreatorProvider>
    </Router>
  );
}

export default App
