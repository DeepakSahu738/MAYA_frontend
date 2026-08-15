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
import DemoPage from './DemoPage.jsx';
import { CreatorProvider } from './analytics/CreatorContext.jsx';
import Login from './login.jsx';
import Register from './register.jsx';
import NotFound from './components/NotFound.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import TermsOfService from './components/TermsOfService.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PageTransition from './components/PageTransition.jsx';
import Onboarding from './components/Onboarding.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import ConnectAccountGate from './components/ConnectAccountGate.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getRoleFromToken, isJwtExpired } from './tokenDecoder/detokenizer';
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
const [showOnboarding, setShowOnboarding] = useState(() => {
  return !localStorage.getItem("maya-onboarded");
});

return (
  <Router>
    <CreatorProvider>
      <ErrorBoundary>
      <Routes>
        {/* Demo page — standalone, no header/footer */}
        <Route path="/demo" element={<DemoPage />} />

        {/* All other pages — with header/footer */}
        <Route path="*" element={
          <div className="flex flex-col min-h-screen">
            <Header />
            <ToastContainer position="top-right" autoClose={4000} />

            {showOnboarding && (
              <Onboarding onComplete={() => setShowOnboarding(false)} />
            )}

            <main className="flex-grow">
              <PageTransition>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* Auth-protected routes that need a connected account */}
                <Route path="/create" element={<AuthGuard><CreatePage /></AuthGuard>} />
                <Route path="/analytics" element={<AuthGuard><ConnectAccountGate><AnalyticsDashboard /></ConnectAccountGate></AuthGuard>} />
                <Route path="/chat" element={<AuthGuard><ConnectAccountGate><AIChatPage /></ConnectAccountGate></AuthGuard>} />
                <Route path="/plan" element={<AuthGuard><ConnectAccountGate><PlanPage /></ConnectAccountGate></AuthGuard>} />
            <Route path="/calendar" element={<AuthGuard><ConnectAccountGate><CalendarPage /></ConnectAccountGate></AuthGuard>} />
                <Route path="/comments" element={<AuthGuard><ConnectAccountGate><CommentsPage /></ConnectAccountGate></AuthGuard>} />
                <Route path="/trends" element={<AuthGuard><ConnectAccountGate><TrendsPage /></ConnectAccountGate></AuthGuard>} />

                {/* Auth-protected but don't need connected account */}
                <Route path="/UserAccountMgnt" element={<AuthGuard><UserAccountMgnt /></AuthGuard>} />
                <Route path="/ContentGenerationFlow" element={<AuthGuard><ContentGenerationFlow /></AuthGuard>} />
                <Route path="/ContentGenerationInstagram" element={<AuthGuard><ContentGenerationInstagram /></AuthGuard>} />
                <Route path="/ContentGenerationSnapchat" element={<AuthGuard><ContentGenerationSnapchat /></AuthGuard>} />
                <Route path="/ContentGenerationYouTube" element={<AuthGuard><ContentGenerationYouTube /></AuthGuard>} />
                <Route path="/ContentGenerationTikTok" element={<AuthGuard><ContentGenerationTikTok /></AuthGuard>} />
                <Route path="/ContentGenerationPinterest" element={<AuthGuard><ContentGenerationPinterest /></AuthGuard>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
              </PageTransition>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
      </ErrorBoundary>
    </CreatorProvider>
    </Router>
);
}

export default App
