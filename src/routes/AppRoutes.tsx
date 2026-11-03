import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import LookupLayout from "../features/invoice/components/layout/LookupLayout"
import AgentPage from "../pages/AgentPage";
import BeneficiairePage from "../pages/BeneficiairePage";
import DeletionRequestsPage from "../pages/DeletionRequestsPage";
import PrestatairePage from "../pages/PrestatairePage";
import PriseEnChargePage from "../pages/PriseEnChargePage";
import ReferentielsPage from "../pages/ReferentielsPage";
import InvoicePage  from "../pages/InvoicePage"
import T5ParAnPage from "../pages/T5ParAn";
import T5ParAnParActePage from "../pages/T5ParAnParActe";
import T5ParSeancePage from "../pages/T5ParSeance";
import { fetchIdpLookupMock } from "../features/invoice/mocks/idpLookup";
import { ROUTES } from "../constants/routes";

function AppShell({ children }: { children: ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<Navigate to={ROUTES.agents} replace />} />
      <Route path={ROUTES.agents} element={<AppShell><AgentPage /></AppShell>} />
      <Route path={ROUTES.beneficiaries} element={<AppShell><BeneficiairePage /></AppShell>} />
      <Route path={ROUTES.providers} element={<AppShell><PrestatairePage /></AppShell>} />
      <Route path={ROUTES.coverage} element={<AppShell><PriseEnChargePage /></AppShell>} />
      <Route path={ROUTES.referentials} element={<AppShell><ReferentielsPage /></AppShell>} />
      <Route path={ROUTES.deletionRequests} element={<AppShell><DeletionRequestsPage /></AppShell>} />
      <Route path={ROUTES.invoice} element={<AppShell><InvoicePage></InvoicePage></AppShell>} />
      <Route path={ROUTES.T5ParAn} element={<LookupLayout onSearchIdp={fetchIdpLookupMock}><T5ParAnPage title="T5 par an" plafond={10_000_000} /></LookupLayout>} />
      <Route path={ROUTES.T5ParAnParActe} element={<LookupLayout onSearchIdp={fetchIdpLookupMock}><T5ParAnParActePage title="T5 par an et par acte" plafondParAn={10_000_000} plafondParActe={1_000_000} /></LookupLayout>} />
      <Route path={ROUTES.T5Parseance} element={<LookupLayout onSearchIdp={fetchIdpLookupMock}><T5ParSeancePage title="T5 par séance" nombreSeance={3} /></LookupLayout>} />
      <Route path="*" element={<Navigate to={ROUTES.agents} replace />} />
    </Routes>
  );
}
