import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Navbar from './components/shared/Navbar.jsx';
import Footer from './components/shared/Footer.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import IdeaDetailPage from './pages/IdeaDetailPage.jsx';
import PitchPage from './pages/PitchPage.jsx';
import EditIdeaPage from './pages/EditIdeaPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Navbar />
            <Routes>
              <Route path="/" element={<BrowsePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/ideas/:id" element={<IdeaDetailPage />} />
              <Route path="/ideas/:id/edit" element={<EditIdeaPage />} />
              <Route path="/pitch" element={<PitchPage />} />
              <Route path="/users/:id" element={<ProfilePage />} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
