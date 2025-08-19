import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "../assets/css/EmployeePartnerContractsPage.css";

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

function EmployeePartnerContractsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        tenDoiTac: "",
        bienSo: "",
        trangThai: "",
    });
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

    // Bộ lọc
    const filteredContracts = contracts.filter((c) => {
        const matchTenDT =
            !filter.tenDoiTac ||
            (c.oto?.doiTac?.hoTen || "")
                .toLowerCase()
                .includes(filter.tenDoiTac.toLowerCase());
        const matchBienSo =
            !filter.bienSo ||
            (c.oto?.bienSo || "")
                .toLowerCase()
                .includes(filter.bienSo.toLowerCase());
        const matchTrangThai =
            !filter.trangThai || c.trangThai === filter.trangThai;
        return matchTenDT && matchBienSo && matchTrangThai;
    });

    return (
        <>
            <Header />
            <div className="partner-contract-list-container">
                <h2>Danh sách hợp đồng cho thuê</h2>
                {/* Bộ lọc */}
                <div
                    style={{
                        display: "flex",
                        gap: 18,
                        marginBottom: 18,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <label>Tên đối tác</label>
                        <input
                            type="text"
                            value={filter.tenDoiTac}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    tenDoiTac: e.target.value,
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
                            <option value="OK">Còn hiệu lực</option>
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
                            {filteredContracts.map((c, idx) => (
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
                                                ? "Còn hiệu lực"
                                                : c.trangThai === "HUY"
                                                ? "Đã hủy"
                                                : c.trangThai ===
                                                  "HET_HAN_HOP_DONG"
                                                ? "Hết hạn"
                                                : c.trangThai}
                                        </span>
                                    </td>
                                    <td>
                                        {(c.trangThai === "HET_HAN_HOP_DONG" ||
                                            c.trangThai === "HUY") && (
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
