import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

const Placeholder = ({ name }) => <h2>{name} page (coming soon)</h2>;

const Page = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
      <Route path="/transactions" element={<Page><Transactions /></Page>} />
      <Route path="/budget" element={<Page><Budget /></Page>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;