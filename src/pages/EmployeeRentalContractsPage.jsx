import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

// Hàm lấy màu cho trạng thái hợp đồng
function getStatusColor(status) {
    switch (status) {
        case "OK":
            return { background: "#bbf7d0", color: "#166534" }; // xanh lá
        case "HUY":
            return { background: "#fecaca", color: "#991b1b" }; // đỏ nhạt
        case "HET_HAN_HOP_DONG":
            return { background: "#fde68a", color: "#b45309" }; // vàng
        default:
            return { background: "#e0e7ef", color: "#334155" }; // xám
    }
}

function EmployeeRentalContractsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [filter, setFilter] = useState({
        tenKhachHang: "",
        bienSo: "",
        trangThai: "",
    });
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

    // Bộ lọc hợp đồng
    const filteredContracts = contracts.filter((c) => {
        const matchTenKH =
            !filter.tenKhachHang ||
            (c.khachHang?.hoTen || "")
                .toLowerCase()
                .includes(filter.tenKhachHang.toLowerCase());
        const matchBienSo =
            !filter.bienSo ||
            (c.oto?.bienSo || "")
                .toLowerCase()
                .includes(filter.bienSo.toLowerCase());
        const matchTrangThai =
            !filter.trangThai || c.trangThai === filter.trangThai;
        return matchTenKH && matchBienSo && matchTrangThai;
    });

    return (
        <>
            <Header />
            <div className="partner-contract-list-container">
                <h2>Danh sách hợp đồng thuê xe</h2>
                {/* Bộ lọc */}
                <div
                    style={{
                        display: "flex",
                        gap: 18,
                        marginBottom: 18,
                        flexWrap: "wrap",
                        background: "#f3f4f6",
                        padding: "18px 24px",
                        borderRadius: "12px",
                        alignItems: "flex-end",
                    }}
                >
                    <div>
                        <label>Tên khách hàng</label>
                        <input
                            type="text"
                            value={filter.tenKhachHang}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    tenKhachHang: e.target.value,
                                }))
                            }
                            placeholder="Nhập tên khách hàng"
                        />
                    </div>
                    <div>
                        <label>Biển số xe</label>
                        <input
                            type="text"
                            value={filter.bienSo}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    bienSo: e.target.value,
                                }))
                            }
                            placeholder="Nhập biển số xe"
                        />
                    </div>
                    <div>
                        <label>Trạng thái</label>
                        <select
                            value={filter.trangThai}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    trangThai: e.target.value,
                                }))
                            }
                        >
                            <option value="">Tất cả</option>
                            <option value="OK">Đang thuê</option>
                            <option value="HUY">Đã hủy</option>
                            <option value="HET_HAN_HOP_DONG">Hết hạn</option>
                        </select>
                    </div>
                </div>
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
                                <th>Ngày bắt đầu hợp đồng</th>
                                <th>Ngày kết thúc hợp đồng</th>
                                <th>Đối tác</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContracts.map((c, idx) => (
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
                                    <td>{c.oto?.doiTac?.hoTen || "N/A"}</td>
                                    <td>
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: 8,
                                                fontWeight: 500,
                                                fontSize: 15,
                                                ...getStatusColor(c.trangThai),
                                                display: "inline-block",
                                            }}
                                        >
                                            {c.trangThai === "OK"
                                                ? "Đang thuê"
                                                : c.trangThai === "HUY"
                                                ? "Đã hủy"
                                                : c.trangThai ===
                                                  "HET_HAN_HOP_DONG"
                                                ? "Hết hạn"
                                                : c.trangThai}
                                        </span>
                                    </td>
                                    <td>
                                        {c.trangThai === "HET_HAN_HOP_DONG" ? (
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
