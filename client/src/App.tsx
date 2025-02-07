import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
//import { ProtectedRoute } from "./lib/protected-route"; //This line is removed as ProtectedRoute is not used anymore

import Home from "./pages/home";
import AuthPage from "./pages/auth-page";
import DatesActivities from "./pages/dates-activities";
import Itinerary from "./pages/itinerary";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/plan/:destination" component={DatesActivities} />
      <Route path="/itinerary/:destination" component={Itinerary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;