import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function AdminRentalContractsPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState(null);
    const [showBlackListModal, setShowBlackListModal] = useState(false);
    const [blackListReason, setBlackListReason] = useState("");
    const [blackListLoading, setBlackListLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/hop-dong-thue")
            .then((res) => {
                setContracts(res.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Xử lý thêm vào danh sách đen
    const handleAddToBlackList = (contract) => {
        setSelectedContract(contract);
        setShowBlackListModal(true);
        setBlackListReason("");
    };

    const handleConfirmBlackList = async () => {
        if (!selectedContract) return;
        setBlackListLoading(true);
        try {
            const request = {
                ngayThem: new Date().toISOString().replace("T", " ").slice(0, 19),
                lyDo: blackListReason,
                quanLyId: JSON.parse(localStorage.getItem("user")).id,
                hopDongThueId: selectedContract.id,
                trangThai: 0, // CHO_DUYET
            };
            await axios.post(
                "http://localhost:8080/api/danh-sach-den/create",
                request
            );
            alert("Đã thêm khách hàng vào danh sách đen!");
            setShowBlackListModal(false);
        } catch {
            alert("Thêm vào danh sách đen thất bại!");
        }
        setBlackListLoading(false);
    };

    return (
        <>
            <Header />
            <div className="partner-contract-list-container">
                <h2>Danh sách hợp đồng thuê xe (Quản lý)</h2>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="contract-partner-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Khách hàng</th>
                                <th>SĐT khách hàng</th>
                                <th>Xe</th>
                                <th>Biển số</th>
                                <th>Ngày nhận xe</th>
                                <th>Ngày trả xe</th>
                                <th>Trạng thái</th>
                                <th>Đối tác</th>
                                <th>SĐT đối tác</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((c, idx) => (
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
                                    <td>{c.oto?.doiTac?.hoTen}</td>
                                    <td>{c.oto?.doiTac?.sdt}</td>
                                    <td>
                                        <button
                                            className="contract-detail-btn"
                                            onClick={() =>
                                                setSelectedContract(c)
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
                {/* Modal chi tiết hợp đồng */}
                {selectedContract && (
                    <div className="car-detail-modal-bg">
                        <div
                            className="car-detail-modal"
                            style={{ minWidth: 400 }}
                        >
                            <span
                                className="car-detail-modal-close"
                                onClick={() => setSelectedContract(null)}
                            >
                                &times;
                            </span>
                            <h3>Chi tiết hợp đồng thuê xe</h3>
                            <div>
                                <b>Khách hàng:</b>{" "}
                                {selectedContract.khachHang?.hoTen}
                            </div>
                            <div>
                                <b>SĐT khách hàng:</b>{" "}
                                {selectedContract.khachHang?.sdt}
                            </div>
                            <div>
                                <b>Xe:</b>{" "}
                                {selectedContract.oto?.mauXe?.hangXe?.ten}{" "}
                                {selectedContract.oto?.mauXe?.ten}
                            </div>
                            <div>
                                <b>Biển số:</b> {selectedContract.oto?.bienSo}
                            </div>
                            <div>
                                <b>Ngày nhận xe:</b>{" "}
                                {selectedContract.checkin
                                    ? new Date(
                                          selectedContract.checkin
                                      ).toLocaleString()
                                    : ""}
                            </div>
                            <div>
                                <b>Ngày trả xe:</b>{" "}
                                {selectedContract.checkout
                                    ? new Date(
                                          selectedContract.checkout
                                      ).toLocaleString()
                                    : ""}
                            </div>
                            <div>
                                <b>Trạng thái:</b>{" "}
                                {selectedContract.trangThai === "OK"
                                    ? "Đang thuê"
                                    : selectedContract.trangThai === "HUY"
                                    ? "Đã hủy"
                                    : selectedContract.trangThai ===
                                      "HET_HAN_HOP_DONG"
                                    ? "Hết hạn"
                                    : selectedContract.trangThai}
                            </div>
                            <div>
                                <b>Đối tác:</b>{" "}
                                {selectedContract.oto?.doiTac?.hoTen}
                            </div>
                            <div>
                                <b>SĐT đối tác:</b>{" "}
                                {selectedContract.oto?.doiTac?.sdt}
                            </div>
                            <div style={{ marginTop: 24 }}>
                                <button
                                    className="contract-btn"
                                    style={{
                                        background: "#991b1b",
                                        color: "#fff",
                                    }}
                                    onClick={() =>
                                        handleAddToBlackList(selectedContract)
                                    }
                                >
                                    Thêm vào danh sách đen
                                </button>
                                <button
                                    className="contract-btn"
                                    style={{ marginLeft: 12 }}
                                    onClick={() => setSelectedContract(null)}
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal thêm vào danh sách đen */}
                {showBlackListModal && (
                    <div className="car-detail-modal-bg">
                        <div
                            className="car-detail-modal"
                            style={{ minWidth: 400 }}
                        >
                            <span
                                className="car-detail-modal-close"
                                onClick={() => setShowBlackListModal(false)}
                            >
                                &times;
                            </span>
                            <h3>Thêm vào danh sách đen</h3>
                            <div>
                                <b>Khách hàng:</b>{" "}
                                {selectedContract?.khachHang?.hoTen}
                            </div>
                            <div>
                                <b>Hợp đồng thuê ID:</b> {selectedContract?.id}
                            </div>
                            <div>
                                <b>Ngày thêm:</b> {new Date().toLocaleString()}
                            </div>
                            <div style={{ margin: "12px 0" }}>
                                <label>Lý do:</label>
                                <textarea
                                    value={blackListReason}
                                    onChange={(e) =>
                                        setBlackListReason(e.target.value)
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
                                style={{ background: "#991b1b", color: "#fff" }}
                                onClick={handleConfirmBlackList}
                                disabled={blackListLoading || !blackListReason}
                            >
                                Xác nhận thêm
                            </button>
                            <button
                                className="contract-btn"
                                style={{ marginLeft: 12 }}
                                onClick={() => setShowBlackListModal(false)}
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

export default AdminRentalContractsPage;
