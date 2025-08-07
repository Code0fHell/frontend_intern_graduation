import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function PartnerInvoicePreviewPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const invoice = location.state?.invoice;
    const contract = location.state?.contract;
    const printRef = useRef();

    if (!invoice || !contract) return <div>Không tìm thấy hóa đơn!</div>;

    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <h2>Hóa đơn thanh lý hợp đồng với đối tác</h2>
                <div
                    ref={printRef}
                    style={{ background: "#fff", padding: 24, borderRadius: 8 }}
                >
                    <h3 style={{ textAlign: "center" }}>
                        HÓA ĐƠN THANH LÝ HỢP ĐỒNG ĐỐI TÁC
                    </h3>
                    <div>
                        <b>Mã hóa đơn:</b> {invoice.id}
                    </div>
                    <div>
                        <b>Đối tác:</b> {contract.oto?.doiTac?.hoTen}
                    </div>
                    <div>
                        <b>Xe:</b> {contract.oto?.bienSo} -{" "}
                        {contract.oto?.mauXe?.ten}
                    </div>
                    <div>
                        <b>Giá thuê:</b> {contract.giaThue?.toLocaleString()}{" "}
                        VNĐ
                    </div>
                    <div>
                        <b>Ngày thanh toán:</b> {new Date(invoice.ngayThanhToan).toISOString().slice(0, 10)}
                    </div>
                    <div>
                        <b>Phương thức thanh toán:</b>{" "}
                        {invoice.phuongThucThanhToan}
                    </div>
                    <div>
                        <b>Ghi chú:</b> {invoice.ghiChu || "Không có"}
                    </div>
                    <div style={{ fontSize: 20, marginTop: 16 }}>
                        <b>Tổng tiền:</b> {invoice.tongTien?.toLocaleString()}{" "}
                        VNĐ
                    </div>
                </div>
                <div style={{ marginTop: 32 }}>
                    <button
                        className="contract-btn contract-btn-approve"
                        onClick={handlePrint}
                        style={{ marginRight: 16 }}
                    >
                        In hóa đơn
                    </button>
                    <button
                        className="contract-btn"
                        onClick={() => navigate("/contracts")}
                    >
                        Quay lại danh sách hợp đồng
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PartnerInvoicePreviewPage;
