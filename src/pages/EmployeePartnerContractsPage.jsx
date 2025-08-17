import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function EmployeePartnerContractsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:8080/hop-dong-cho-thue/all")
            .then((res) => {
                setContracts(res.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <Header />
            <div className="partner-contract-list-container">
                <h2>Danh sách hợp đồng cho thuê</h2>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="contract-partner-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Xe</th>
                                <th>Biển số</th>
                                <th>Đối tác</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((c, idx) => (
                                <tr key={c.id}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        {c.oto?.mauXe?.hangXe?.ten}{" "}
                                        {c.oto?.mauXe?.ten}
                                    </td>
                                    <td>{c.oto?.bienSo}</td>
                                    <td>{c.oto?.doiTac?.hoTen}</td>
                                    <td>
                                        {c.ngayBatDau
                                            ? new Date(
                                                  c.ngayBatDau
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        {c.ngayKetThuc
                                            ? new Date(
                                                  c.ngayKetThuc
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        {c.trangThai === "OK"
                                            ? "Còn hiệu lực"
                                            : c.trangThai === "HUY"
                                            ? "Đã hủy"
                                            : c.trangThai === "HET_HAN_HOP_DONG"
                                            ? "Hết hạn"
                                            : c.trangThai}
                                    </td>
                                    <td>
                                        {c.trangThai === "HET_HAN_HOP_DONG" && (
                                            <button
                                                className="contract-detail-btn"
                                                onClick={() =>
                                                    navigate(
                                                        "/create-partner-invoice",
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
                                        )}
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

export default EmployeePartnerContractsPage;
