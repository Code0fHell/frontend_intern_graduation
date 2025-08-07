import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import React from "react";
import "../assets/css/PartnerContractDetailPage.css";

function PartnerContractDetailPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const contract = location.state?.contract;

    if (!contract)
        return (
            <div>
                <Header />
                <div style={{ padding: 32 }}>Không tìm thấy hợp đồng!</div>
                <Footer />
            </div>
        );

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <h2>Chi tiết hợp đồng cho thuê với đối tác</h2>
                <div>
                    <b>Xe:</b> {contract.oto?.mauXe?.hangXe?.ten}{" "}
                    {contract.oto?.mauXe?.ten}
                </div>
                <div>
                    <b>Biển số:</b> {contract.oto?.bienSo}
                </div>
                <div>
                    <b>Ngày bắt đầu:</b>{" "}
                    {contract.ngayBatDau
                        ? new Date(contract.ngayBatDau).toLocaleDateString()
                        : ""}
                </div>
                <div>
                    <b>Ngày kết thúc:</b>{" "}
                    {contract.ngayKetThuc
                        ? new Date(contract.ngayKetThuc).toLocaleDateString()
                        : ""}
                </div>
                <div>
                    <b>Giá thuê:</b>{" "}
                    {contract.giaThue
                        ? contract.giaThue.toLocaleString() + "đ"
                        : ""}
                </div>
                <div>
                    <b>Nhân viên ký:</b> {contract.nhanVien?.hoTen || ""}
                </div>
                <div>
                    <b>Đối tác:</b> {contract.oto?.doiTac?.hoTen || ""}
                </div>
                <div>
                    <b>Ghi chú:</b> {contract.ghiChu || ""}
                </div>
                <div style={{ marginTop: 24 }}>
                    <button
                        className="contract-btn contract-btn-liquidate"
                        onClick={() =>
                            navigate("/create-partner-invoice", {
                                state: { contract },
                            })
                        }
                    >
                        Thanh lý hợp đồng
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PartnerContractDetailPage;
