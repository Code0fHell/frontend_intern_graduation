import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PartnerRentalContractsPage() {
    const { user } = useAuth();
    const [waitingContracts, setWaitingContracts] = useState([]);
    const [allContracts, setAllContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Bộ lọc cho tất cả hợp đồng
    const [filter, setFilter] = useState({
        tenKhachHang: "",
        sdtKhachHang: "",
        ngayNhan: "",
        ngayTra: "",
    });

    useEffect(() => {
        if (!user?.id) return;
        // Lấy danh sách hợp đồng thuê xe chờ duyệt
        axios
            .get("http://localhost:8080/api/hop-dong-thue/cho-duyet")
            .then((res) => {
                // Lọc hợp đồng của đối tác hiện tại
                const filtered = (res.data || []).filter(
                    (c) => c.oto?.doiTac?.id === user.id
                );
                setWaitingContracts(filtered);
            });

        // Lấy tất cả hợp đồng thuê xe của đối tác
        axios
            .get("http://localhost:8080/api/hop-dong-thue")
            .then((res) => {
                const filtered = (res.data || []).filter(
                    (c) => c.oto?.doiTac?.id === user.id
                );
                setAllContracts(filtered);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user?.id]);

    // Lọc danh sách tất cả hợp đồng
    const filteredContracts = allContracts.filter((c) => {
        const matchTen =
            !filter.tenKhachHang ||
            (c.khachHang?.hoTen || "")
                .toLowerCase()
                .includes(filter.tenKhachHang.toLowerCase());
        const matchSdt =
            !filter.sdtKhachHang ||
            (c.khachHang?.sdt || c.khachHang?.soDienThoai || "").includes(
                filter.sdtKhachHang
            );
        const matchNgayNhan =
            !filter.ngayNhan ||
            (c.thoiGianNhan &&
                new Date(c.thoiGianNhan).toISOString().slice(0, 10) ===
                    filter.ngayNhan);
        const matchNgayTra =
            !filter.ngayTra ||
            (c.thoiGianTra &&
                new Date(c.thoiGianTra).toISOString().slice(0, 10) ===
                    filter.ngayTra);
        return matchTen && matchSdt && matchNgayNhan && matchNgayTra;
    });

    // Thêm hàm lấy màu cho trạng thái
    function getStatusColor(status) {
        switch (status) {
            case "CHO_DUYET":
                return { background: "#fde68a", color: "#b45309" }; // vàng
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

    return (
        <>
            <Header />
            <div
                className="partner-rental-contracts-container"
                style={{ minHeight: "80vh", padding: 24 }}
            >
                <h2>Hợp đồng thuê xe chờ duyệt</h2>
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
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {waitingContracts.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ textAlign: "center" }}>
                                    Không có hợp đồng chờ duyệt.
                                </td>
                            </tr>
                        )}
                        {waitingContracts.map((c, idx) => (
                            <tr key={c.id}>
                                <td>{idx + 1}</td>
                                <td>{c.khachHang?.hoTen}</td>
                                <td>
                                    {c.oto?.mauXe?.hangXe?.ten}{" "}
                                    {c.oto?.mauXe?.ten}
                                </td>
                                <td>{c.oto?.bienSo}</td>
                                <td>
                                    {c.thoiGianNhan
                                        ? new Date(
                                              c.thoiGianNhan
                                          ).toLocaleDateString()
                                        : ""}
                                </td>
                                <td>
                                    {c.thoiGianTra
                                        ? new Date(
                                              c.thoiGianTra
                                          ).toLocaleDateString()
                                        : ""}
                                </td>
                                <td>
                                    {c.trangThai === "CHO_DUYET"
                                        ? "Chờ duyệt"
                                        : c.trangThai}
                                </td>
                                <td>
                                    <button
                                        className="contract-detail-btn"
                                        onClick={() =>
                                            navigate(`/contracts/${c.id}`, {
                                                state: { contract: c },
                                            })
                                        }
                                    >
                                        Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2 style={{ marginTop: 40 }}>Tất cả hợp đồng thuê xe</h2>
                {/* Bộ lọc */}
                <div
                    className="contract-filter-row"
                    style={{
                        marginBottom: 16,
                        display: "flex",
                        gap: 24,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <label>Tên khách hàng</label>
                        <input
                            type="text"
                            value={filter.tenKhachHang}
                            onChange={(e) =>
                                setFilter({
                                    ...filter,
                                    tenKhachHang: e.target.value,
                                })
                            }
                            placeholder="Nhập tên khách hàng"
                        />
                    </div>
                    <div>
                        <label>Số điện thoại khách hàng</label>
                        <input
                            type="text"
                            value={filter.sdtKhachHang}
                            onChange={(e) =>
                                setFilter({
                                    ...filter,
                                    sdtKhachHang: e.target.value,
                                })
                            }
                            placeholder="Nhập SĐT khách hàng"
                        />
                    </div>
                    <div>
                        <label>Ngày nhận xe dự kiến</label>
                        <input
                            type="date"
                            value={filter.ngayNhan}
                            onChange={(e) =>
                                setFilter({
                                    ...filter,
                                    ngayNhan: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label>Ngày trả xe dự kiến</label>
                        <input
                            type="date"
                            value={filter.ngayTra}
                            onChange={(e) =>
                                setFilter({
                                    ...filter,
                                    ngayTra: e.target.value,
                                })
                            }
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
                                <th>Khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Xe</th>
                                <th>Biển số</th>
                                <th>Ngày nhận xe</th>
                                <th>Ngày trả xe</th>
                                <th>Trạng thái</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContracts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        style={{ textAlign: "center" }}
                                    >
                                        Không có hợp đồng nào.
                                    </td>
                                </tr>
                            )}
                            {filteredContracts.map((c, idx) => (
                                <tr key={c.id}>
                                    <td>{idx + 1}</td>
                                    <td>{c.khachHang?.hoTen}</td>
                                    <td>{c.khachHang?.sdt}</td>
                                    <td>
                                        {c.oto?.mauXe?.hangXe?.ten}{" "}
                                        {c.oto?.mauXe?.ten}
                                    </td>
                                    <td>{c.oto?.bienSo}</td>
                                    <td>
                                        {c.thoiGianNhan
                                            ? new Date(
                                                  c.thoiGianNhan
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        {c.thoiGianTra
                                            ? new Date(
                                                  c.thoiGianTra
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
                                            {c.trangThai === "CHO_DUYET"
                                                ? "Chờ duyệt"
                                                : c.trangThai === "OK"
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
                                        <button
                                            className="contract-detail-btn"
                                            onClick={() =>
                                                navigate(`/contracts/${c.id}`, {
                                                    state: { contract: c },
                                                })
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
            </div>
            <Footer />
        </>
    );
}

export default PartnerRentalContractsPage;
