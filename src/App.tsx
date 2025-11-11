import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { JourneyProvider, useJourney } from "./contexts/JourneyContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import InstallPrompt from "./components/InstallPrompt";
import SplashScreen from "./components/SplashScreen";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import CalendarView from "./pages/CalendarView";
import Reports from "./pages/Reports";
import JourneyListPage from "./pages/JourneyList";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import PDFPreview from "./pages/PDFPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente de rotas protegidas (requer autenticação)
function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">Carregando...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RotasApp() {
  const { isOnboarded } = useJourney();
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rotas públicas (sem autenticação) */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />

      {/* Rotas protegidas (requer autenticação) */}
      <Route
        path="/"
        element={
          <RotaProtegida>
            {isOnboarded ? <Dashboard /> : <Navigate to="/onboarding" replace />}
          </RotaProtegida>
        }
      />
      <Route 
        path="/onboarding" 
        element={
          <RotaProtegida>
            {isOnboarded ? <Navigate to="/" replace /> : <Onboarding />}
          </RotaProtegida>
        }
      />
      <Route 
        path="/settings" 
        element={
          <RotaProtegida>
            <Onboarding />
          </RotaProtegida>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <RotaProtegida>
            <CalendarView />
          </RotaProtegida>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <RotaProtegida>
            <Reports />
          </RotaProtegida>
        } 
      />
      <Route 
        path="/pdf-preview" 
        element={
          <RotaProtegida>
            <PDFPreview />
          </RotaProtegida>
        } 
      />
      <Route 
        path="/journeys" 
        element={
          <RotaProtegida>
            <JourneyListPage />
          </RotaProtegida>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Componente interno que precisa do contexto de autenticação
function ConteudoApp() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("splashShown");
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Só mostra splash se o usuário estiver logado
    if (!loading) {
      if (user && showSplash) {
        // Usuário logado e splash não foi mostrada ainda
        setIsReady(false);
      } else {
        // Usuário não logado ou splash já foi mostrada
        setIsReady(true);
        setShowSplash(false);
      }
    }
  }, [loading, user, showSplash]);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
    setIsReady(true);
  };

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">Carregando...</div>
    </div>;
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <InstallPrompt />
      {showSplash && user && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {isReady && (
        <BrowserRouter>
          <RotasApp />
        </BrowserRouter>
      )}
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <JourneyProvider>
          <TooltipProvider>
            <ConteudoApp />
          </TooltipProvider>
        </JourneyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
