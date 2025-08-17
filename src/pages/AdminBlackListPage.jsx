import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function AdminBlackListPage() {
    const [blackList, setBlackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        thoiGian: "",
        tenKhachHang: "",
        sdtKhachHang: "",
    });
    const [editItem, setEditItem] = useState(null);
    const [editReason, setEditReason] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlackList();
    }, []);

    const fetchBlackList = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "http://localhost:8080/api/danh-sach-den/all"
            );
            setBlackList(res.data || []);
        } catch {
            setBlackList([]);
        }
        setLoading(false);
    };

    // Lọc danh sách đen
    const filteredList = blackList.filter((item) => {
        const matchThoiGian =
            !filter.thoiGian ||
            (item.ngayThem &&
                new Date(item.ngayThem).toISOString().slice(0, 10) ===
                    filter.thoiGian);
        const matchTen =
            !filter.tenKhachHang ||
            (item.khachHang?.hoTen || "")
                .toLowerCase()
                .includes(filter.tenKhachHang.toLowerCase());
        const matchSdt =
            !filter.sdtKhachHang ||
            (item.khachHang?.sdt || "")
                .toLowerCase()
                .includes(filter.sdtKhachHang.toLowerCase());
        return matchThoiGian && matchTen && matchSdt;
    });

    // Mở modal cập nhật lý do
    const handleEdit = (item) => {
        setEditItem(item);
        setEditReason(item.lyDo || "");
    };

    // Xác nhận cập nhật lý do
    const handleConfirmEdit = async () => {
        if (!editItem) return;
        setEditLoading(true);
        try {
            await axios.put("http://localhost:8080/api/danh-sach-den/update", {
                ...editItem,
                lyDo: editReason,
            });
            alert("Cập nhật thành công!");
            setEditItem(null);
            fetchBlackList();
        } catch {
            alert("Cập nhật thất bại!");
        }
        setEditLoading(false);
    };

    return (
        <>
            <Header />
            <div className="partner-contract-list-container">
                <h2>Danh sách đen khách hàng</h2>
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
                        <label>Thời gian thêm</label>
                        <input
                            type="date"
                            value={filter.thoiGian}
                            onChange={(e) =>
                                setFilter({
                                    ...filter,
                                    thoiGian: e.target.value,
                                })
                            }
                        />
                    </div>
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
                </div>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="contract-partner-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên khách hàng</th>
                                <th>SĐT khách hàng</th>
                                <th>Ngày thêm</th>
                                <th>Lý do</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{ textAlign: "center" }}
                                    >
                                        Không có khách hàng nào trong danh sách
                                        đen.
                                    </td>
                                </tr>
                            )}
                            {filteredList.map((item, idx) => (
                                <tr key={item.id}>
                                    <td>{idx + 1}</td>
                                    <td>{item.khachHang?.hoTen}</td>
                                    <td>{item.khachHang?.sdt}</td>
                                    <td>
                                        {item.ngayThem
                                            ? new Date(
                                                  item.ngayThem
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>{item.lyDo}</td>
                                    <td>
                                        <button
                                            className="contract-btn"
                                            onClick={() => handleEdit(item)}
                                        >
                                            Cập nhật
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {/* Modal cập nhật lý do */}
                {editItem && (
                    <div className="car-detail-modal-bg">
                        <div
                            className="car-detail-modal"
                            style={{ minWidth: 400 }}
                        >
                            <span
                                className="car-detail-modal-close"
                                onClick={() => setEditItem(null)}
                            >
                                &times;
                            </span>
                            <h3>Cập nhật lý do danh sách đen</h3>
                            <div>
                                <b>Khách hàng:</b> {editItem.khachHang?.hoTen}
                            </div>
                            <div>
                                <b>SĐT khách hàng:</b> {editItem.khachHang?.sdt}
                            </div>
                            <div>
                                <b>Ngày thêm:</b>{" "}
                                {editItem.ngayThem
                                    ? new Date(
                                          editItem.ngayThem
                                      ).toLocaleString()
                                    : ""}
                            </div>
                            <div style={{ margin: "12px 0" }}>
                                <label>Lý do:</label>
                                <textarea
                                    value={editReason}
                                    onChange={(e) =>
                                        setEditReason(e.target.value)
                                    }
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        borderRadius: 6,
                                        border: "1px solid #eee",
                                        padding: 6,
                                    }}
                                />
                            </div>
                            <button
                                className="contract-btn"
                                style={{ background: "#0ea5e9", color: "#fff" }}
                                onClick={handleConfirmEdit}
                                disabled={editLoading || !editReason}
                            >
                                Xác nhận cập nhật
                            </button>
                            <button
                                className="contract-btn"
                                style={{ marginLeft: 12 }}
                                onClick={() => setEditItem(null)}
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default AdminBlackListPage;
