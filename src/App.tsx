import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/layout/Sidebar";
import AgentPage from "./pages/AgentPage";

function ShellRoute({ children }: { children: React.ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}

const App = () => {
  return (
    <Routes>
      <Route
        path="/agents"
        element={
          <ShellRoute>
            <AgentPage />
          </ShellRoute>
        }
      />
    <Route path="/" element={<ShellRoute><AgentPage/></ShellRoute>}/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;