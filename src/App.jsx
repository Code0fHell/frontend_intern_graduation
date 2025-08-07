import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CarListPage from "./pages/CarListPage";
import CarRegisterPage from "./pages/CarRegisterPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import CarDetailPage from "./pages/CarDetailPage";
import PartnerCarPage from "./pages/PartnerCarPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ContractDetailPage from "./pages/ContractDetailPage";
import ContractListPage from "./pages/ContractListPage";
import AdminCarListPage from "./pages/AdminCarListPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import InvoicePreviewPage from "./pages/InvoicePreviewPage";
import CreatePartnerContractPage from "./pages/CreatePartnerContractPage";
import EmployeeCarListPage from "./pages/EmployeeCarListPage";
import ContractPartnerPage from "./pages/ContractPartnerPage";
import PartnerContractDetailPage from "./pages/PartnerContractDetailPage";
import CreatePartnerInvoicePage from "./pages/CreatePartnerInvoicePage";
import PartnerInvoicePreviewPage from "./pages/PartnerInvoicePreviewPage";

function RoleRouter() {
    const { user } = useAuth();

    if (!user) {
        // Chưa đăng nhập, chuyển về trang đăng nhập
        return <Navigate to="/login" />;
    }

    if (user.id?.includes("KH")) {
        // Khách hàng: trang thuê xe tự lái
        return <HomePage />;
    }

    if (user.id?.includes("DT")) {
        // Đối tác: trang quản lý xe cho thuê
        return <PartnerCarPage />;
    }

    if (user.id?.includes("NV")) {
        return <ContractListPage />;
    }

    if (user.id?.includes("QL")) {
        return <AdminCarListPage />;
    }

    return (
        <div style={{ padding: 40, textAlign: "center" }}>
            Vui lòng đăng nhập bằng tài khoản phù hợp để sử dụng hệ thống.
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<RoleRouter />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<SignUpPage />} />
                    <Route path="/cars" element={<CarListPage />} />
                    <Route path="/cars/:id" element={<CarDetailPage />} />
                    <Route path="/register-car" element={<CarRegisterPage />} />
                    <Route path="/partner_cars" element={<PartnerCarPage />} />
                    <Route path="/contracts" element={<ContractListPage />} />
                    <Route
                        path="/contracts/:id"
                        element={<ContractDetailPage />}
                    />
                    <Route path="/admin/cars" element={<AdminCarListPage />} />
                    <Route
                        path="/create-invoice"
                        element={<CreateInvoicePage />}
                    />
                    <Route
                        path="/invoice-preview"
                        element={<InvoicePreviewPage />}
                    />
                    <Route
                        path="/create-contract/:id"
                        element={<CreatePartnerContractPage />}
                    />
                    <Route
                        path="/employee-cars"
                        element={<EmployeeCarListPage />}
                    />
                    <Route
                        path="/partner-contracts"
                        element={<ContractPartnerPage />}
                    />
                    <Route
                        path="/partner-contracts/:id"
                        element={<PartnerContractDetailPage />}
                    />
                    <Route
                        path="/create-partner-invoice"
                        element={<CreatePartnerInvoicePage />}
                    />
                    <Route
                        path="/partner-invoice-preview"
                        element={<PartnerInvoicePreviewPage />}
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
