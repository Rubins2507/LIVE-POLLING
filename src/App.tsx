import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePollPage } from './pages/CreatePollPage';
import { PollCreatedPage } from './pages/PollCreatedPage';
import { PublicPollPage } from './pages/PublicPollPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { Poll } from './types';

function AppContent() {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [recentlyCreatedPoll, setRecentlyCreatedPoll] = useState<Poll | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check URL routes
  const isPublicPoll = currentPath.startsWith('/poll/');
  const publicShareId = isPublicPoll ? currentPath.replace('/poll/', '').split('/')[0] : '';

  const isPollCreated = currentPath.startsWith('/polls/created/');
  const createdShareId = isPollCreated ? currentPath.replace('/polls/created/', '').split('/')[0] : '';

  // Standalone full-screen public poll view (Screen 7 in image)
  if (isPublicPoll && publicShareId) {
    return <PublicPollPage shareId={publicShareId} navigate={navigate} />;
  }

  // Dashboard layout routes
  const isDashboardLayout =
    currentPath === '/dashboard' ||
    currentPath.startsWith('/dashboard#') ||
    currentPath === '/polls/create' ||
    currentPath === '/profile' ||
    currentPath === '/settings';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentPath={currentPath} navigate={navigate} />

      {/* Main Content Area */}
      {isDashboardLayout ? (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Dashboard Sidebar */}
          <Sidebar
            currentPath={currentPath}
            navigate={navigate}
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />

          {/* Dynamic Dashboard View */}
          <div className="flex-1 min-w-0 bg-slate-50">
            {currentPath === '/dashboard' && <DashboardPage navigate={navigate} />}
            {currentPath === '/polls/create' && (
              <CreatePollPage
                navigate={navigate}
                onPollCreated={(p) => setRecentlyCreatedPoll(p)}
              />
            )}
            {currentPath === '/profile' && <ProfilePage navigate={navigate} />}
            {currentPath === '/settings' && <SettingsPage navigate={navigate} />}
          </div>
        </div>
      ) : (
        <main className="flex-1 flex flex-col">
          {currentPath === '/' && <LandingPage navigate={navigate} />}
          {currentPath === '/signup' && <SignupPage navigate={navigate} />}
          {currentPath === '/login' && <LoginPage navigate={navigate} />}
          {isPollCreated && createdShareId && (
            <PollCreatedPage
              shareId={createdShareId}
              pollData={recentlyCreatedPoll}
              navigate={navigate}
            />
          )}
        </main>
      )}

      {/* Footer on public marketing pages */}
      {!isDashboardLayout && !isPollCreated && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
