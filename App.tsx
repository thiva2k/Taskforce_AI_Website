import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { useTranslation } from 'react-i18next';
import { Header } from './components/layout/Header';
import { Home } from './components/pages/Home';
import { ServiceDetail } from './components/pages/ServiceDetail';
import { BookDemo } from './components/pages/BookDemo';
import { Contact } from './components/pages/Contact';
import { About } from './components/pages/About';
import { Blog } from './components/pages/Blog';
import { BlogPost } from './components/pages/BlogPost';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BlogEditor } from './components/admin/BlogEditor';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { GlobalSpotlight } from './components/ui/GlobalSpotlight';
import { InteractiveBackground } from './components/ui/InteractiveBackground';
import { TechScrollIndicator } from './components/ui/TechScrollIndicator';
import { LanguagePopup } from './components/ui/LanguagePopup';
import Chatbot from './components/ui/Chatbot';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />

        <div className="text-white min-h-screen selection:bg-primary-DEFAULT selection:text-white relative">
          <InteractiveBackground />
          <GlobalSpotlight />
          <TechScrollIndicator />

          <AnimatePresence>
            {isLoading && <LoadingScreen />}
          </AnimatePresence>

          {!isLoading && (
            <>
              <LanguagePopup />
              <Header />

              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/service/:id" element={<ServiceDetail />} />
                  <Route path="/book-demo" element={<BookDemo />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />

                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/new"
                    element={
                      <ProtectedRoute>
                        <BlogEditor />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/edit/:id"
                    element={
                      <ProtectedRoute>
                        <BlogEditor />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>

              <Chatbot />
            </>
          )}
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;