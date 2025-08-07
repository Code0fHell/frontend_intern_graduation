import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/ContractDetailPage.css";
import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import axios from "axios";

function ContractDetailPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const contract = location.state?.contract;
    const { user } = useAuth();

    const [checkin, setCheckin] = useState(
        contract?.checkin
            ? new Date(contract.checkin).toISOString().slice(0, 16)
            : ""
    );
    const [checkout, setCheckout] = useState(
        contract?.checkout
            ? new Date(contract.checkout).toISOString().slice(0, 16)
            : ""
    );
    const [loading, setLoading] = useState(false);
    const [loadingCheckin, setLoadingCheckin] = useState(false);
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [localContract, setLocalContract] = useState(
        contract
            ? { ...contract, nhanVien: contract.nhanVien || { id: user?.id } }
            : contract
    );
    const [showModal, setShowModal] = useState(false);
    const [taiSan, setTaiSan] = useState(null);
    const [loaiTaiSan, setLoaiTaiSan] = useState("Tiền mặt");
    const [giaTriTaiSan, setGiaTriTaiSan] = useState("");
    const [moTaTaiSan, setMoTaTaiSan] = useState("");
    const [xacNhanLoading, setXacNhanLoading] = useState(false);

    if (!contract)
        return (
            <div className="contract-root">
                <Header />
                <div className="contract-detail-container">
                    Không tìm thấy hợp đồng!
                </div>
                <Footer />
            </div>
        );

    // Xác định loại tài khoản
    const isKH = user?.id?.includes("KH");
    const isNV = user?.id?.includes("NV");

    // Cập nhật thời gian checkin
    const handleCheckin = async () => {
        setLoadingCheckin(true);
        try {
            const res = await axios.put(
                `http://localhost:8080/api/renting/hop-dong-thue/checkin/${localContract.id}`
            );
            setLocalContract({
                ...localContract,
                checkin: res.data.checkin,
            });
            setCheckin(new Date(res.data.checkin).toISOString().slice(0, 16));
            alert("Cập nhật check-in thành công!");
        } catch {
            alert("Cập nhật check-in thất bại!");
        }
        setLoadingCheckin(false);
    };

    // Cập nhật thời gian checkout
    const handleCheckout = async () => {
        setLoadingCheckout(true);
        try {
            const res = await axios.put(
                `http://localhost:8080/api/renting/hop-dong-thue/checkout/${localContract.id}`
            );
            setLocalContract({ ...localContract, checkout: res.data.checkout });
            setCheckout(new Date(res.data.checkout).toISOString().slice(0, 16));
            alert("Cập nhật check-out thành công!");
        } catch {
            alert("Cập nhật check-out thất bại!");
        }
        setLoadingCheckout(false);
    };

    // Phê duyệt hợp đồng
    const handleConfirm = async () => {
        setLoading(true);
        try {
            const res = await axios.put(
                `http://localhost:8080/api/renting/hop-dong-thue/confirm/${localContract.id}`
            );
            setLocalContract({
                ...localContract,
                trangThai: res.data.trangThai,
            });
            alert("Phê duyệt hợp đồng thành công!");
        } catch {
            alert("Phê duyệt thất bại!");
        }
        setLoading(false);
    };

    // Thanh lý hợp đồng
    const handleLiquidate = () => {
        navigate("/create-invoice", { state: { contract: localContract } });
    };

    // Khi mở lại hợp đồng, lấy tài sản cầm cố từ localStorage nếu có
    useEffect(() => {
        if (localContract?.id) {
            const data = localStorage.getItem(
                `taiSanCamCo_${localContract.id}`
            );
            if (data) setTaiSan(JSON.parse(data));
        }
    }, [localContract?.id]);

    // Khi xác nhận tài sản cầm cố, lưu vào localStorage
    const handleXacNhanTaiSan = async () => {
        setXacNhanLoading(true);
        try {
            const request = [
                {
                    tenTaiSan: loaiTaiSan,
                    loaiTaiSan: loaiTaiSan,
                    giaTriTaiSan: parseFloat(giaTriTaiSan),
                    moTa: moTaTaiSan,
                    thoiGianNhan: new Date(),
                    khachHangId: localContract.khachHang?.id,
                    hopDongThueId: localContract.id,
                    nhanVienNhanId: user.id,
                },
            ];
            const res = await axios.post(
                "http://localhost:8080/api/renting/tai-san-cam-co/nhan",
                request
            );
            setTaiSan(res.data[0]);
            // Lưu vào localStorage
            localStorage.setItem(
                `taiSanCamCo_${localContract.id}`,
                JSON.stringify(res.data[0])
            );
            setShowModal(false);
        } catch {
            alert("Xác nhận tài sản cầm cố thất bại!");
        }
        setXacNhanLoading(false);
    };

    // Khi trả tài sản cầm cố, xóa khỏi localStorage
    const handleTraTaiSan = async () => {
        setXacNhanLoading(true);
        try {
            await axios.put(
                "http://localhost:8080/api/renting/tai-san-cam-co/tra",
                {
                    taiSanCamCoId: taiSan.id,
                    nhanVienTraId: user.id,
                }
            );
            setTaiSan(null);
            // Xóa khỏi localStorage
            localStorage.removeItem(`taiSanCamCo_${localContract.id}`);
            alert("Đã trả tài sản cầm cố!");
        } catch {
            alert("Trả tài sản cầm cố thất bại!");
        }
        setXacNhanLoading(false);
    };

    // Xử lý hủy hợp đồng
    const handleCancelContract = async () => {
        if (!window.confirm("Bạn chắc chắn muốn hủy hợp đồng này?")) return;
        try {
            await axios.put(
                `http://localhost:8080/api/renting/hop-dong-thue/cancel/${localContract.id}`
            );
            alert("Hủy hợp đồng thành công!");
            navigate("/contracts");
        } catch {
            alert("Hủy hợp đồng thất bại!");
        }
    };

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <h2>Chi tiết hợp đồng thuê xe</h2>
                <div className="contract-detail-section">
                    <h3>Bên A: ChevMaz</h3>
                    <div>
                        Địa chỉ: Km10, Đường Nguyễn Trãi, Q. Hà Đông, Hà Nội
                    </div>
                    <div>Điện thoại: 0358146215</div>
                </div>
                <div className="contract-detail-section">
                    <h3>Bên B: {localContract.khachHang?.hoTen}</h3>
                    <div>
                        Điện thoại:{" "}
                        {localContract.khachHang?.soDienThoai ||
                            localContract.khachHang?.sdt}
                    </div>
                    <div>Email: {localContract.khachHang?.email}</div>
                </div>
                <div className="contract-detail-section">
                    <h3>Thông tin xe</h3>
                    <div>Biển số: {localContract.oto?.bienSo}</div>
                    <div>Hãng xe: {localContract.oto?.mauXe?.hangXe?.ten}</div>
                    <div>Mẫu xe: {localContract.oto?.mauXe?.ten}</div>
                    <div>Số ghế: {localContract.oto?.mauXe?.soGhe}</div>
                    {/* <div>Số ghế: {localContract.oto?.mauXe?.soGhe}</div> */}
                </div>
                <div className="contract-detail-section">
                    <h3>Thời gian thuê</h3>
                    <div className="contract-time-row">
                        <span className="contract-time-label">
                            Ngày nhận (KH chọn):
                        </span>
                        <span className="contract-time-value">
                            {localContract.thoiGianNhan
                                ? new Date(
                                      localContract.thoiGianNhan
                                  ).toLocaleString()
                                : "Chưa xác định"}
                        </span>
                    </div>
                    <div className="contract-time-row">
                        <span className="contract-time-label">
                            Ngày trả (KH chọn):
                        </span>
                        <span className="contract-time-value">
                            {localContract.thoiGianTra
                                ? new Date(
                                      localContract.thoiGianTra
                                  ).toLocaleString()
                                : "Chưa xác định"}
                        </span>
                    </div>
                    <div className="contract-time-row">
                        <span className="contract-time-label">
                            Check-in hợp đồng:
                        </span>
                        <span className="contract-time-value">
                            {localContract.checkin
                                ? new Date(
                                      localContract.checkin
                                  ).toLocaleString()
                                : "Chưa check-in"}
                            {isNV && !localContract.checkin && (
                                <button
                                    className="contract-btn contract-btn-update"
                                    style={{ marginLeft: 12 }}
                                    onClick={handleCheckin}
                                    disabled={loadingCheckin}
                                >
                                    Cập nhật check-in
                                </button>
                            )}
                        </span>
                    </div>
                    <div className="contract-time-row">
                        <span className="contract-time-label">
                            Check-out hợp đồng:
                        </span>
                        <span className="contract-time-value">
                            {localContract.checkout
                                ? new Date(
                                      localContract.checkout
                                  ).toLocaleString()
                                : "Chưa check-out"}
                            {isNV && !localContract.checkout && (
                                <button
                                    className="contract-btn contract-btn-update"
                                    style={{ marginLeft: 12 }}
                                    onClick={handleCheckout}
                                    disabled={loadingCheckout}
                                >
                                    Cập nhật check-out
                                </button>
                            )}
                        </span>
                    </div>
                    {/* Tổng tiền thuê giữ nguyên */}
                    <div style={{ marginTop: 8, fontWeight: 500 }}>
                        Tổng tiền thuê (chưa tính phụ phí):&nbsp;
                        {(() => {
                            let tongTien = 0;
                            if (
                                localContract.thoiGianNhan &&
                                localContract.thoiGianTra &&
                                localContract.oto?.gia
                            ) {
                                const nhan = new Date(
                                    localContract.thoiGianNhan
                                );
                                const tra = new Date(localContract.thoiGianTra);
                                let soNgay = Math.ceil(
                                    (tra - nhan) / (1000 * 60 * 60 * 24)
                                );
                                if (soNgay < 1) soNgay = 1;
                                tongTien = soNgay * localContract.oto.gia;
                            }
                            return tongTien > 0
                                ? tongTien.toLocaleString() + "đ"
                                : "";
                        })()}
                    </div>
                </div>
                <div className="contract-detail-section">
                    <h3>Mô tả</h3>
                    <div>{localContract.moTa}</div>
                </div>
                <div className="contract-detail-section">
                    <h3>Đánh giá & Nhận xét</h3>
                    <div>Nhận xét: {localContract.nhanXet || "Chưa có"}</div>
                    <div>
                        Đánh giá:{" "}
                        {localContract.danhGiaSo
                            ? `${localContract.danhGiaSo} ★`
                            : "Chưa có"}
                    </div>
                </div>
                <div className="contract-detail-section">
                    <h3>Tài sản cầm cố</h3>
                    {taiSan
                        ? isNV && (
                              <div style={{ marginBottom: 12 }}>
                                  <div>
                                      <b>Loại tài sản:</b> {taiSan.loaiTaiSan}
                                  </div>
                                  <div>
                                      <b>Giá trị:</b>{" "}
                                      {taiSan.gia?.toLocaleString()} VNĐ
                                  </div>
                                  <div>
                                      <b>Mô tả:</b> {taiSan.moTa}
                                  </div>
                                  <button
                                      className="contract-btn contract-btn-cancel"
                                      onClick={handleTraTaiSan}
                                      disabled={xacNhanLoading}
                                  >
                                      Trả tài sản cầm cố
                                  </button>
                              </div>
                          )
                        : isNV && (
                              <button
                                  className="contract-btn contract-btn-approve"
                                  onClick={() => setShowModal(true)}
                              >
                                  Xác nhận tài sản cầm cố
                              </button>
                          )}
                </div>
                <div className="contract-detail-actions">
                    {/* Chỉ hiển thị nút Hủy hợp đồng khi là KH, hợp đồng chưa phê duyệt và chưa checkin */}
                    {isKH &&
                        localContract.trangThai === "CHO_DUYET" &&
                        !localContract.checkin && (
                            <button
                                className="contract-btn contract-btn-cancel"
                                onClick={handleCancelContract}
                            >
                                Hủy hợp đồng
                            </button>
                        )}
                    {isNV && localContract.trangThai === "CHO_DUYET" && (
                        <button
                            className="contract-btn contract-btn-approve"
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            Phê duyệt hợp đồng
                        </button>
                    )}
                    {isNV && localContract.trangThai === "OK" && (
                        <button
                            className="contract-btn contract-btn-liquidate"
                            onClick={handleLiquidate}
                            disabled={loading}
                        >
                            Thanh lý hợp đồng
                        </button>
                    )}
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Xác nhận tài sản cầm cố</h3>
                        <div style={{ marginBottom: 12 }}>
                            <label>
                                Loại tài sản:
                                <select
                                    value={loaiTaiSan}
                                    onChange={(e) =>
                                        setLoaiTaiSan(e.target.value)
                                    }
                                    style={{ marginLeft: 8, padding: 4 }}
                                >
                                    <option value="Tiền mặt">Tiền mặt</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </label>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>
                                Giá trị (VNĐ):
                                <input
                                    type="number"
                                    value={giaTriTaiSan}
                                    onChange={(e) =>
                                        setGiaTriTaiSan(e.target.value)
                                    }
                                    style={{
                                        marginLeft: 8,
                                        padding: 4,
                                        width: 120,
                                    }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>
                                Mô tả:
                                <input
                                    type="text"
                                    value={moTaTaiSan}
                                    onChange={(e) =>
                                        setMoTaTaiSan(e.target.value)
                                    }
                                    style={{
                                        marginLeft: 8,
                                        padding: 4,
                                        width: 220,
                                    }}
                                />
                            </label>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button
                                className="contract-btn contract-btn-approve"
                                onClick={handleXacNhanTaiSan}
                                disabled={xacNhanLoading || !giaTriTaiSan}
                            >
                                Xác nhận
                            </button>
                            <button
                                className="contract-btn contract-btn-cancel"
                                onClick={() => setShowModal(false)}
                                disabled={xacNhanLoading}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default ContractDetailPage;
