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
import ContractListPage_Customer from "./pages/ContractListPage_Customer";
import AdminCarListPage from "./pages/AdminCarListPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import InvoicePreviewPage from "./pages/InvoicePreviewPage";
import CreatePartnerContractPage from "./pages/CreatePartnerContractPage";
import ContractPartnerPage from "./pages/ContractPartnerPage";
import ContractPartnerDetailPage from "./pages/ContractPartnerDetailPage";
import CreatePartnerInvoicePage from "./pages/CreatePartnerInvoicePage";
import PartnerInvoicePreviewPage from "./pages/PartnerInvoicePreviewPage";
import PartnerContractListPage from "./pages/PartnerContractListPage";
import PartnerRentalContractsPage from "./pages/PartnerRentalContractsPage";
import EmployeeRentalContractsPage from "./pages/EmployeeRentalContractsPage";
import EmployeePartnerContractsPage from "./pages/EmployeePartnerContractsPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import PartnerCarDetailPage from "./pages/PartnerCarDetailPage";
import BlackListPage from "./pages/BlackListPage";

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
        return <EmployeeRentalContractsPage />;
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
                    <Route
                        path="/contract-partner-detail/:id"
                        element={<ContractPartnerDetailPage />}
                    />
                    <Route path="/register-car" element={<CarRegisterPage />} />
                    <Route path="/partner_cars" element={<PartnerCarPage />} />
                    <Route
                        path="/contracts_customer"
                        element={<ContractListPage_Customer />}
                    />
                    <Route
                        path="/contracts/:id"
                        element={<ContractDetailPage />}
                    />
                    <Route path="/admin/cars" element={<AdminCarListPage />} />
                    <Route
                        path="/black-list"
                        element={<BlackListPage />}
                    />
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
                        path="/partner-contracts"
                        element={<ContractPartnerPage />}
                    />
                    <Route
                        path="/create-partner-invoice"
                        element={<CreatePartnerInvoicePage />}
                    />
                    <Route
                        path="/partner-invoice-preview"
                        element={<PartnerInvoicePreviewPage />}
                    />
                    <Route
                        path="/admin/partner-contracts"
                        element={<PartnerContractListPage />}
                    />
                    <Route
                        path="/partner/rental-contracts"
                        element={<PartnerRentalContractsPage />}
                    />
                    <Route
                        path="/employee/rental-contracts"
                        element={<EmployeeRentalContractsPage />}
                    />
                    <Route
                        path="/employee/partner-contracts"
                        element={<EmployeePartnerContractsPage />}
                    />
                    <Route path="/invoice-list" element={<InvoiceListPage />} />
                    <Route
                        path="/partner/car-detail/:id"
                        element={<PartnerCarDetailPage />}
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
