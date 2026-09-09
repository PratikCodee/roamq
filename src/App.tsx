import { Component, ReactNode, useEffect } from 'react';
import { RouterProvider, useRouter } from '@/router/Router';
import { SavedItemsProvider } from '@/hooks/useSavedItemsContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { ToastContainer } from '@/components/ui/Toast';
import { seedIfNeeded } from '@/store/seed';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { DestinationPage } from '@/pages/DestinationPage';
import { PlacesPage } from '@/pages/PlacesPage';
import { HotelsPage } from '@/pages/HotelsPage';
import { FoodPage } from '@/pages/FoodPage';
import { ActivitiesPage } from '@/pages/ActivitiesPage';
import { MapPage } from '@/pages/MapPage';
import { PlannerPage } from '@/pages/PlannerPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { BusinessRegisterPage } from '@/pages/BusinessRegisterPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { CustomerDashboard } from '@/pages/CustomerDashboard';

// Seed demo data once on startup
seedIfNeeded();

const DEFAULT_DESTINATION = 'dest-ratnagiri';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-navy-50">
          <h2 className="text-2xl font-bold text-navy-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-navy-500 max-w-md">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.hash = '#/';
            }}
            className="mt-6 btn-primary px-6 py-2.5 text-sm"
          >
            Return to Home Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppShell() {
  const { route, navigate } = useRouter();
  const { isAdmin, isCustomer } = useAuth();

  // ── Route guards ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (route.name === 'admin' && !isAdmin) {
      navigate({ name: 'login' });
    }
    if (route.name === 'customer-dashboard' && !isCustomer) {
      navigate({ name: 'login' });
    }
  }, [route.name, isAdmin, isCustomer, navigate]);

  const destinationId =
    route.name === 'home' || route.name === 'profile'
      ? DEFAULT_DESTINATION
      : route.name === 'login' || route.name === 'business-register'
        || route.name === 'admin' || route.name === 'customer-dashboard'
      ? DEFAULT_DESTINATION
      : (route as { destinationId?: string }).destinationId ?? DEFAULT_DESTINATION;

  const isLanding  = route.name === 'home';
  const isAuthPage = route.name === 'login' || route.name === 'business-register';
  const isFullPage = route.name === 'admin' || route.name === 'customer-dashboard';

  const currentDestId = (route as { destinationId?: string }).destinationId || DEFAULT_DESTINATION;
  const currentQuery = (route as { q?: string }).q;

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && !isFullPage && <Navbar destinationId={destinationId} />}
      <main className="flex-1">
        <ErrorBoundary>
          {route.name === 'home'               && <LandingPage />}
          {route.name === 'destination'        && <DestinationPage destinationId={currentDestId} />}
          {route.name === 'places'             && <PlacesPage destinationId={currentDestId} initialQuery={currentQuery} />}
          {route.name === 'hotels'             && <HotelsPage destinationId={currentDestId} initialQuery={currentQuery} />}
          {route.name === 'food'               && <FoodPage destinationId={currentDestId} initialQuery={currentQuery} />}
          {route.name === 'activities'         && <ActivitiesPage destinationId={currentDestId} initialQuery={currentQuery} />}
          {route.name === 'map'                && <MapPage destinationId={currentDestId} />}
          {route.name === 'planner'            && <PlannerPage destinationId={currentDestId} />}
          {route.name === 'profile'            && <ProfilePage />}
          {route.name === 'login'              && <LoginPage />}
          {route.name === 'business-register'  && <BusinessRegisterPage />}
          {route.name === 'admin'              && isAdmin && <AdminDashboard />}
          {route.name === 'customer-dashboard' && isCustomer && <CustomerDashboard />}
        </ErrorBoundary>
      </main>
      {!isLanding && !isAuthPage && !isFullPage && <Footer destinationId={destinationId} />}
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppDataProvider>
          <SavedItemsProvider>
            <AppShell />
          </SavedItemsProvider>
        </AppDataProvider>
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;
