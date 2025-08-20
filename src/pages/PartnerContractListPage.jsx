import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/PartnerContractListPage.css";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "OK", label: "Còn hiệu lực" },
    { value: "HUY", label: "Đã hủy" },
    { value: "HET_HAN_HOP_DONG", label: "Hết hạn hợp đồng" },
];

function PartnerContractListPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bộ lọc
    const [filter, setFilter] = useState({
        ngayBatDau: "",
        ngayKetThuc: "",
        trangThai: "",
        bienSo: "",
    });
    // Hàm lấy màu cho trạng thái hợp đồng
    function getStatusColor(status) {
        switch (status) {
            case "OK":
                return { background: "#bbf7d0", color: "#166534" }; // xanh lá
            case "HUY":
                return { background: "#fecaca", color: "#991b1b" }; // đỏ nhạt
            case "HET_HAN_HOP_DONG":
                return { background: "#fca5a5", color: "#991b1b" }; // đỏ
            default:
                return { background: "#e0e7ef", color: "#334155" }; // xám
        }
    }

    // Dữ liệu đã lọc
    const [filteredContracts, setFilteredContracts] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/hop-dong-cho-thue/all")
            .then((res) => {
                setContracts(Array.isArray(res.data) ? res.data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Lọc dữ liệu theo filter
    useEffect(() => {
        let result = contracts;
        if (filter.ngayBatDau) {
            result = result.filter(
                (c) =>
                    c.ngayBatDau &&
                    new Date(c.ngayBatDau) >= new Date(filter.ngayBatDau)
            );
        }
        if (filter.ngayKetThuc) {
            result = result.filter(
                (c) =>
                    c.ngayKetThuc &&
                    new Date(c.ngayKetThuc) <= new Date(filter.ngayKetThuc)
            );
        }
        if (filter.trangThai) {
            result = result.filter(
                (c) =>
                    (c.trangThai || "").toUpperCase() ===
                    filter.trangThai.toUpperCase()
            );
        }
        if (filter.bienSo) {
            result = result.filter((c) =>
                (c.oto?.bienSo || "")
                    .toLowerCase()
                    .includes(filter.bienSo.toLowerCase())
            );
        }
        setFilteredContracts(result);
    }, [contracts, filter]);

    return (
        <>
            <Header />
            <div className="partner-contract-list-container">
                <h2>Danh sách hợp đồng với đối tác</h2>
                {/* Bộ lọc mở rộng */}
                <div
                    className="contract-filter-row"
                    style={{
                        display: "flex",
                        gap: 16,
                        marginBottom: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <label>Ngày bắt đầu</label>
                        <input
                            type="date"
                            value={filter.ngayBatDau}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    ngayBatDau: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label>Ngày kết thúc</label>
                        <input
                            type="date"
                            value={filter.ngayKetThuc}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    ngayKetThuc: e.target.value,
                                }))
                            }
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
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Biển số</label>
                        <input
                            type="text"
                            value={filter.bienSo}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    bienSo: e.target.value,
                                }))
                            }
                            placeholder="Nhập biển số"
                        />
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
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Giá thuê</th>
                                <th>Trạng thái</th>
                                <th>Bên A</th>
                                <th>Bên B</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContracts.map((contract, idx) => (
                                <tr key={contract.id}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        {contract.oto?.mauXe?.hangXe?.ten}{" "}
                                        {contract.oto?.mauXe?.ten}
                                    </td>
                                    <td>
                                        {contract.oto?.bienSo || "Không rõ"}
                                    </td>
                                    <td>
                                        {contract.ngayBatDau
                                            ? new Date(
                                                  contract.ngayBatDau
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        {contract.ngayKetThuc
                                            ? new Date(
                                                  contract.ngayKetThuc
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        {contract?.oto?.gia
                                            ? contract.oto.gia.toLocaleString(
                                                  "vi-VN"
                                              )
                                            : ""}{" "}
                                        đ/ngày
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: 8,
                                                fontWeight: 500,
                                                fontSize: 15,
                                                ...getStatusColor(
                                                    contract.trangThai
                                                ),
                                                display: "inline-block",
                                            }}
                                        >
                                            {contract.trangThai
                                                ? STATUS_OPTIONS.find(
                                                      (s) =>
                                                          s.value ===
                                                          contract.trangThai
                                                  )?.label || contract.trangThai
                                                : ""}
                                        </span>
                                    </td>
                                    <td>ChevMaz</td>
                                    <td>{contract?.oto?.doiTac?.hoTen}</td>
                                    <td>
                                        <button
                                            className="contract-detail-btn"
                                            onClick={() =>
                                                (window.location.href = `/contract-partner-detail/${contract.id}`)
                                            }
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {filteredContracts.length === 0 && (
                    <div style={{ marginTop: 24 }}>Không có hợp đồng nào.</div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default PartnerContractListPage;
