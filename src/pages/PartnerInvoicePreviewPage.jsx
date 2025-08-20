import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import "../assets/css/PartnerInvoicePreviewPage.css";

function PartnerInvoicePreviewPage() {
    const location = useLocation();
    const invoice = location.state?.invoice;
    const contract = location.state?.contract;
    const printRef = useRef();
    const tongDoanhThu = location.state?.tongDoanhThu;

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
                <div ref={printRef} className="partner-invoice-preview">
                    <h2 className="partner-invoice-title">
                        HÓA ĐƠN THANH LÝ HỢP ĐỒNG ĐỐI TÁC
                    </h2>
                    <div className="partner-invoice-section">
                        <b>Mã hóa đơn:</b> {invoice.id}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Ngày thanh toán:</b>{" "}
                        {new Date(invoice.ngayThanhToan).toLocaleDateString()}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Phương thức thanh toán:</b>{" "}
                        {invoice.phuongThucThanhToan}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Ghi chú:</b> {invoice.ghiChu || "Không có"}
                    </div>
                    <hr className="partner-invoice-divider" />
                    <h3 className="partner-invoice-subtitle">
                        I. Thông tin đối tác
                    </h3>
                    <div className="partner-invoice-section">
                        <b>Họ tên:</b> {contract.oto?.doiTac?.hoTen}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Địa chỉ:</b> {contract.oto?.doiTac?.diaChi?.soNha},{" "}
                        {contract.oto?.doiTac?.diaChi?.phuong},{" "}
                        {contract.oto?.doiTac?.diaChi?.quan},{" "}
                        {contract.oto?.doiTac?.diaChi?.tinh}
                    </div>
                    <div className="partner-invoice-section">
                        <b>SĐT:</b> {contract.oto?.doiTac?.sdt}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Email:</b> {contract.oto?.doiTac?.email}
                    </div>
                    <hr className="partner-invoice-divider" />
                    <h3 className="partner-invoice-subtitle">
                        II. Thông tin xe
                    </h3>
                    <div className="partner-invoice-section">
                        <b>Biển số:</b> {contract.oto?.bienSo}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Hãng xe:</b> {contract.oto?.mauXe?.hangXe?.ten}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Mẫu xe:</b> {contract.oto?.mauXe?.ten}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Số ghế:</b> {contract.oto?.mauXe?.soGhe}
                    </div>
                    <hr className="partner-invoice-divider" />
                    <h3 className="partner-invoice-subtitle">
                        III. Thông tin hợp đồng cho thuê
                    </h3>
                    <div className="partner-invoice-section">
                        <b>Ngày bắt đầu:</b>{" "}
                        {contract.ngayBatDau
                            ? new Date(contract.ngayBatDau).toLocaleDateString()
                            : ""}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Ngày kết thúc:</b>{" "}
                        {contract.ngayKetThuc
                            ? new Date(
                                  contract.ngayKetThuc
                              ).toLocaleDateString()
                            : ""}
                    </div>
                    <div className="partner-invoice-section">
                        <b>Giá thuê:</b> {contract?.oto?.gia?.toLocaleString()}{" "}
                        VNĐ
                    </div>
                    <div className="partner-invoice-section">
                        <b>Phần trăm của đối tác:</b>{" "}
                        {contract.phanTramCuaDoiTac}%
                    </div>
                    <div className="partner-invoice-section">
                        <b>Tổng doanh thu:</b> {tongDoanhThu.toLocaleString()}{" "}
                        VNĐ
                    </div>
                    <hr className="partner-invoice-divider" />
                    <div
                        className="partner-invoice-section"
                        style={{ fontSize: 20, marginTop: 16 }}
                    >
                        <b>Tổng tiền thanh toán:</b>{" "}
                        {invoice.tongTien?.toLocaleString()} VNĐ
                    </div>
                </div>
                <div style={{ marginTop: 32 }}>
                    <button
                        className="contract-btn contract-btn-approve"
                        onClick={handlePrint}
                    >
                        In hóa đơn
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PartnerInvoicePreviewPage;
