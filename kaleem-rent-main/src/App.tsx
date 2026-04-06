import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./pages/admin/AdminLayout";
import Ledger from "./pages/admin/Ledger";
import BuildingExplorer from "./pages/admin/BuildingExplorer";
import ManageBuildings from "./pages/admin/ManageBuildings";
import ManageFlats from "./pages/admin/ManageFlats";
import ManageTenants from "./pages/admin/ManageTenants";
import ManagePayments from "./pages/admin/ManagePayments";
import ManageExpenses from "./pages/admin/ManageExpenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<BuildingExplorer />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="buildings" element={<ManageBuildings />} />
            <Route path="flats" element={<ManageFlats />} />
            <Route path="tenants" element={<ManageTenants />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="expenses" element={<ManageExpenses />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
