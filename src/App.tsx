import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import AgentPage from "./pages/AgentPage";
import BeneficiairePage from "./pages/BeneficiairePage";
import PrestatairePage from "./pages/PrestatairePage";
import PriseEnChargePage from "./pages/PriseEnChargePage";
import ReferentielsPage from "./pages/ReferentielsPage";

function ShellRoute({ children }: { children: ReactNode }) {
	return <Sidebar>{children}</Sidebar>;
}

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/agents" replace />} />
			<Route
				path="/agents"
				element={
					<ShellRoute>
						<AgentPage />
					</ShellRoute>
				}
			/>
			<Route
				path="/beneficiaires"
				element={
					<ShellRoute>
						<BeneficiairePage />
					</ShellRoute>
				}
			/>
			<Route
				path="/prestataires"
				element={
					<ShellRoute>
						<PrestatairePage />
					</ShellRoute>
				}
			/>
			<Route
				path="/pec"
				element={
					<ShellRoute>
						<PriseEnChargePage />
					</ShellRoute>
				}
			/>
			<Route
				path="/referentiels"
				element={
					<ShellRoute>
						<ReferentielsPage />
					</ShellRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/agents" replace />} />
		</Routes>
	);
}
