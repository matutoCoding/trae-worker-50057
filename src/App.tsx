import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import TaskList from "@/pages/Tasks/TaskList";
import TaskNew from "@/pages/Tasks/TaskNew";
import TaskDetail from "@/pages/Tasks/TaskDetail";
import VehicleDispatch from "@/pages/Vehicles";
import StaffScheduling from "@/pages/Staff";
import RouteNavigation from "@/pages/Navigation";
import TransferRegistration from "@/pages/Transfer";
import ColdStorage from "@/pages/ColdStorage";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskNew />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/vehicles" element={<VehicleDispatch />} />
          <Route path="/staff" element={<StaffScheduling />} />
          <Route path="/navigation" element={<RouteNavigation />} />
          <Route path="/transfer" element={<TransferRegistration />} />
          <Route path="/cold-storage" element={<ColdStorage />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
