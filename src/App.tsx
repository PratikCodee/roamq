import { useEffect } from 'react';
import { RouterProvider, useRouter } from '@/router/Router';
import { SavedItemsProvider } from '@/hooks/useSavedItemsContext';
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

const DEFAULT_DESTINATION = 'dest-ratnagiri';

function AppShell() {
  const { route } = useRouter();
  const destinationId =
    route.name === 'home' || route.name === 'profile'
      ? DEFAULT_DESTINATION
      : route.name === 'login' || route.name === 'business-register'
      ? DEFAULT_DESTINATION
      : route.destinationId;

  const isLanding  = route.name === 'home';
  const isAuthPage = route.name === 'login' || route.name === 'business-register';

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <Navbar destinationId={destinationId} />}
      <main className="flex-1">
        {route.name === 'home'              && <LandingPage />}
        {route.name === 'destination'       && <DestinationPage destinationId={route.destinationId} />}
        {route.name === 'places'            && <PlacesPage destinationId={route.destinationId} initialQuery={route.q} />}
        {route.name === 'hotels'            && <HotelsPage destinationId={route.destinationId} initialQuery={route.q} />}
        {route.name === 'food'              && <FoodPage destinationId={route.destinationId} initialQuery={route.q} />}
        {route.name === 'activities'        && <ActivitiesPage destinationId={route.destinationId} initialQuery={route.q} />}
        {route.name === 'map'               && <MapPage destinationId={route.destinationId} />}
        {route.name === 'planner'           && <PlannerPage destinationId={route.destinationId} />}
        {route.name === 'profile'           && <ProfilePage />}
        {route.name === 'login'             && <LoginPage />}
        {route.name === 'business-register' && <BusinessRegisterPage />}
      </main>
      {!isLanding && !isAuthPage && <Footer destinationId={destinationId} />}
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <SavedItemsProvider>
        <AppShell />
      </SavedItemsProvider>
    </RouterProvider>
  );
}

export default App;
