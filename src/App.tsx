import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { ThemeProvider } from "@/context/ThemeContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StainBackground } from "@/components/layout/StainBackground";
import { ChatBot } from "@/components/ChatBot";
import Home from "@/pages/Home";
import Fleet from "@/pages/Fleet";
import CarDetails from "@/pages/CarDetails";
import Booking from "@/pages/Booking";
import VehicleReserve from "@/pages/VehicleReserve";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Destinations from "@/pages/Destinations";
import DestinationDetail from "@/pages/DestinationDetail";
import Terms from "@/pages/Terms";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Account from "@/pages/Account";
import FleetUnsubscribe from "@/pages/FleetUnsubscribe";
import { SeoProvider } from "@/context/SeoContext";
import { SeoHead } from "@/components/SeoHead";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <div className="relative min-h-screen flex flex-col surface-page selection:bg-primary selection:text-black">
      <StainBackground />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <Navbar />
        <main className="flex-1 pb-[6.75rem] md:pb-0">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/fleet" component={Fleet} />
            <Route path="/car-details/:id" component={CarDetails} />
            <Route path="/booking" component={Booking} />
            <Route path="/reserve" component={VehicleReserve} />
            <Route path="/about" component={About} />
            <Route path="/destinations" component={Destinations} />
            <Route path="/destinations/:slug" component={DestinationDetail} />
            <Route path="/services" component={Destinations} />
            <Route path="/contact" component={Contact} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={SignUp} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/account" component={Account} />
            <Route path="/fleet-unsubscribe" component={FleetUnsubscribe} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/terms" component={Terms} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <ChatBot />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <SeoProvider>
                  <SeoHead />
                  <Router />
                </SeoProvider>
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
