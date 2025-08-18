import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function getStatusColor(status) {
    switch (status) {
        case "CHO_DUYET":
            return { background: "#fde68a", color: "#b45309" }; // vàng
        case "OK":
            return { background: "#bbf7d0", color: "#166534" }; // xanh lá
        case "HUY":
            return { background: "#fecaca", color: "#991b1b" }; // đỏ nhạt
        default:
            return { background: "#e0e7ef", color: "#334155" }; // xám
    }
}

function BlackListPage() {
    const [blackList, setBlackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        thoiGian: "",
        tenKhachHang: "",
        sdtKhachHang: "",
    });
    const [editItem, setEditItem] = useState(null);
    const [editStatus, setEditStatus] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const isDT = user?.id?.includes("DT");
    const isQL = user?.id?.includes("QL");

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

    // Mở modal cập nhật trạng thái
    const handleEdit = (item) => {
        setEditItem(item);
        setEditStatus(item.trangThai || "CHO_DUYET");
    };

    // Xác nhận cập nhật trạng thái
    const handleConfirmEdit = async () => {
        if (!editItem) return;
        setEditLoading(true);
        try {
            let trangThaiNum = 0;
            if (editStatus === "OK") trangThaiNum = 1;
            else if (editStatus === "HUY") trangThaiNum = 2;
            await axios.put("http://localhost:8080/api/danh-sach-den/update", {
                ...editItem,
                trangThai: trangThaiNum,
            });
            alert("Cập nhật trạng thái thành công!");
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
                                <th>Trạng thái</th>
                                {!isDT && <th>Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={isDT ? 6 : 7}
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
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: 8,
                                                fontWeight: 500,
                                                fontSize: 15,
                                                ...getStatusColor(
                                                    item.trangThai
                                                ),
                                                display: "inline-block",
                                            }}
                                        >
                                            {item.trangThai === "CHO_DUYET"
                                                ? "Chờ duyệt"
                                                : item.trangThai === "OK"
                                                ? "Đã duyệt"
                                                : item.trangThai === "HUY"
                                                ? "Đã hủy"
                                                : item.trangThai}
                                        </span>
                                    </td>
                                    {!isDT && (
                                        <td>
                                            {isQL && (
                                                <button
                                                    className="contract-btn"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                >
                                                    Cập nhật
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {/* Modal cập nhật trạng thái */}
                {editItem && isQL && (
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
                            <h3>Cập nhật trạng thái danh sách đen</h3>
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
                                <label>Trạng thái:</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) =>
                                        setEditStatus(e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        borderRadius: 6,
                                        border: "1px solid #eee",
                                        padding: 6,
                                    }}
                                >
                                    <option value="CHO_DUYET">Chờ duyệt</option>
                                    <option value="OK">Đã duyệt</option>
                                    <option value="HUY">Từ chối</option>
                                </select>
                            </div>
                            <button
                                className="contract-btn"
                                style={{ background: "#0ea5e9", color: "#fff" }}
                                onClick={handleConfirmEdit}
                                disabled={editLoading}
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

export default BlackListPage;
