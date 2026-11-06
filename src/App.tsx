import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./components/layout/MainLayout";

export default function App() {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}