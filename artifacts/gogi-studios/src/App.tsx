import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { EditProvider } from "@/contexts/EditContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { EditToolbar } from "@/components/ui/EditToolbar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Hire from "@/pages/Hire";
import Interviews from "@/pages/Interviews";
import Projects from "@/pages/Projects";
import Awards from "@/pages/Awards";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Books from "@/pages/Books";
import Merchandise from "@/pages/Merchandise";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/AdminLogin";
import WorkGalleryPage from "@/pages/WorkGalleryPage";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/hire" component={Hire} />
      <Route path="/interviews" component={Interviews} />
      <Route path="/projects" component={Projects} />
      <Route path="/awards" component={Awards} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/books" component={Books} />
      <Route path="/merchandise" component={Merchandise} />
      {/* Dynamic work gallery — any /work/:slug */}
      <Route path="/work/:slug">
        {(params: { slug?: string }) => <WorkGalleryPage slug={params?.slug ?? ""} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <EditProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <ScrollToTop />
              <Switch>
                <Route path="/admin" component={AdminLogin} />
                <Route>
                  <div className="min-h-[100dvh] flex flex-col selection:bg-primary/20 selection:text-primary">
                    <Navbar />
                    <main className="flex-1 flex flex-col">
                      <Router />
                    </main>
                    <Footer />
                  </div>
                </Route>
              </Switch>
            </WouterRouter>
            <Toaster />
            <EditToolbar />
          </EditProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
