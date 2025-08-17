import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function EmployeeRentalContractsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/hop-dong-thue")
            .then((res) => {
                setContracts(res.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        // Lấy danh sách hóa đơn
        axios
            .get("http://localhost:8080/api/hoa-don")
            .then((res) => {
                setInvoices(res.data || []);
            })
            .catch(() => {});
    }, []);

    console.log("contracts: " + JSON.stringify(contracts));
    console.log("invoices: " + JSON.stringify(invoices));
    return (
        <>
            <Header />
            <div className="partner-contract-list-container">
                <h2>Danh sách hợp đồng thuê xe</h2>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="contract-partner-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Khách hàng</th>
                                <th>Xe</th>
                                <th>Biển số</th>
                                <th>Ngày nhận xe</th>
                                <th>Ngày trả xe</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((c, idx) => (
                                <tr key={c.id}>
                                    <td>{idx + 1}</td>
                                    <td>{c.khachHang?.hoTen}</td>
                                    <td>
                                        {c.oto?.mauXe?.hangXe?.ten}{" "}
                                        {c.oto?.mauXe?.ten}
                                    </td>
                                    <td>{c.oto?.bienSo}</td>
                                    <td>
                                        {c.checkin
                                            ? new Date(
                                                  c.checkin
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        {c.checkout
                                            ? new Date(
                                                  c.checkout
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        {c.trangThai === "OK"
                                            ? "Đang thuê"
                                            : c.trangThai === "HUY"
                                            ? "Đã hủy"
                                            : c.trangThai === "HET_HAN_HOP_DONG"
                                            ? "Hết hạn"
                                            : c.trangThai}
                                    </td>
                                    <td>
                                        {c.trangThai === "HET_HAN_HOP_DONG" ? (
                                            (
                                                <button
                                                    className="contract-detail-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            "/create-invoice",
                                                            {
                                                                state: {
                                                                    contract: c,
                                                                },
                                                            }
                                                        )
                                                    }
                                                >
                                                    Tạo hóa đơn
                                                </button>
                                            )
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <Footer />
        </>
    );
}

export default EmployeeRentalContractsPage;
