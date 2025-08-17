import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/ContractPartnerPage.css";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "OK", label: "Còn hiệu lực" },
    { value: "HUY", label: "Đã hủy" },
    { value: "HET_HAN_HOP_DONG", label: "Hết hạn hợp đồng" },
];

function ContractPartnerPage() {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));

    // Bộ lọc
    const [filter, setFilter] = useState({
        ngayBatDau: "",
        ngayKetThuc: "",
        trangThai: "",
        bienSo: "",
    });

    // Dữ liệu đã lọc
    const [filteredContracts, setFilteredContracts] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        axios
            .get("http://localhost:8080/hop-dong-cho-thue/all")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                // Lọc hợp đồng của đối tác hiện tại
                const partnerContracts = data.filter(
                    (c) => c.oto?.doiTac?.id === user.id
                );
                setContracts(partnerContracts);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user?.id]);

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

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="contract-partner-root">
            <Header />
            <div className="contract-partner-list-container">
                <h2>Danh sách hợp đồng cho thuê của bạn</h2>

                {/* Bộ lọc */}
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
                        <label style={{ fontSize: 13 }}>Ngày bắt đầu</label>
                        <input
                            type="date"
                            value={filter.ngayBatDau}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    ngayBatDau: e.target.value,
                                }))
                            }
                            style={{
                                padding: 4,
                                borderRadius: 4,
                                border: "1px solid #ccc",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 13 }}>Ngày kết thúc</label>
                        <input
                            type="date"
                            value={filter.ngayKetThuc}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    ngayKetThuc: e.target.value,
                                }))
                            }
                            style={{
                                padding: 4,
                                borderRadius: 4,
                                border: "1px solid #ccc",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 13 }}>Trạng thái</label>
                        <select
                            value={filter.trangThai}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    trangThai: e.target.value,
                                }))
                            }
                            style={{
                                padding: 4,
                                borderRadius: 4,
                                border: "1px solid #ccc",
                            }}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 13 }}>Biển số</label>
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
                            style={{
                                padding: 4,
                                borderRadius: 4,
                                border: "1px solid #ccc",
                            }}
                        />
                    </div>
                </div>

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
                                <td>{contract.oto?.bienSo || "Không rõ"}</td>
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
                                <td>{contract?.oto?.gia} VNĐ/ngày</td>
                                <td>
                                    {contract.trangThai
                                        ? STATUS_OPTIONS.find(
                                              (s) =>
                                                  s.value === contract.trangThai
                                          )?.label || contract.trangThai
                                        : ""}
                                </td>
                                <td>ChevMaz</td>
                                <td>{contract?.oto?.doiTac?.hoTen}</td>
                                <td>
                                    <button
                                        className="contract-detail-btn"
                                        onClick={() =>
                                            navigate(`/contract-partner-detail/${contract.id}`)
                                        }
                                    >
                                        Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredContracts.length === 0 && (
                    <div style={{ marginTop: 24 }}>Không có hợp đồng nào.</div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default ContractPartnerPage;
