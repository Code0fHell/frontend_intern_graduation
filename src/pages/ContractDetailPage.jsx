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
   
    const [loading, setLoading] = useState(false);
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
    const [showSuggestBlackListModal, setShowSuggestBlackListModal] =
        useState(false);
    const [suggestReason, setSuggestReason] = useState("");
    const [suggestLoading, setSuggestLoading] = useState(false);

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
    const isDT = user?.id?.includes("DT");
    const isApproved = localContract.trangThai === "OK"; // Đã phê duyệt

    // Phê duyệt hợp đồng
    const handleConfirm = async () => {
        setLoading(true);
        try {
            const res = await axios.put(
                `http://localhost:8080/api/hop-dong-thue/confirm/${localContract.id}`
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

    // Đề xuất thêm vào danh sách đen
    const handleSuggestBlackList = async () => {
        if (!localContract.khachHang?.id || !localContract.id) {
            alert("Không tìm thấy thông tin khách hàng hoặc hợp đồng!");
            return;
        }
        setSuggestLoading(true);
        try {
            const request = {
                ngayThem: new Date().toISOString().replace("T", " ").slice(0, 19),
                lyDo: suggestReason,
                quanLyId: "QL0002",
                hopDongThueId: localContract.id,
                trangThai: "0"
            };
            await axios.post(
                "http://localhost:8080/api/danh-sach-den/create",
                request
            );
            alert("Đã đề xuất thêm khách hàng vào danh sách đen!");
            setShowSuggestBlackListModal(false);
        } catch {
            alert("Đề xuất thất bại!");
        }
        setSuggestLoading(false);
    };

    // Thanh lý hợp đồng
    const handleLiquidate = async () => {
        try {
            setLoading(true);
            const res = await axios.put(
                `http://localhost:8080/api/hop-dong-thue/thanh-ly/${localContract.id}`
            );
            setLocalContract({
                ...localContract,
                trangThai: res.data.trangThai,
            });
            alert("Thanh lý hợp đồng thành công!");
        } catch {
            alert("Thanh lý hợp đồng thất bại!");
        }
        setLoading(false);
    };

    // Khi xác nhận tài sản cầm cố, lưu vào localStorage và cập nhật trạng thái "DA_NHAN"
    const handleXacNhanTaiSan = async () => {
        setXacNhanLoading(true);
        try {
            const request = [
                {
                    tenTaiSan: loaiTaiSan,
                    loaiTaiSan: loaiTaiSan,
                    giaTriTaiSan: parseFloat(giaTriTaiSan),
                    moTa: moTaTaiSan,
                    thoiGianNhan: new Date().getTime(),
                    khachHangId: localContract.khachHang?.id,
                    hopDongThueId: localContract.id,
                    doiTacId: user.id,
                },
            ];
            const res = await axios.post(
                "http://localhost:8080/api/tai-san-cam-co/nhan",
                request
            );
            // Thêm trạng thái "DA_NHAN"
            setTaiSan({ ...res.data[0], trangThai: "DA_NHAN" });
            setShowModal(false);
            alert("Đã nhận tài sản cầm cố!");
        } catch {
            alert("Xác nhận tài sản cầm cố thất bại!");
        }
        setXacNhanLoading(false);
    };

    // Hàm trả tài sản cầm cố: cập nhật trạng thái "DA_TRA" thay vì xóa
    const handleTraTaiSan = async () => {
        if (!taiSan?.id) {
            alert("Không tìm thấy tài sản cầm cố để trả!");
            return;
        }
        if (!window.confirm("Bạn chắc chắn muốn trả tài sản cầm cố này?"))
            return;
        setXacNhanLoading(true);
        try {
            await axios.put("http://localhost:8080/api/tai-san-cam-co/tra", {
                taiSanCamCoId: taiSan.id,
                doiTacId: user.id,
            });
            // Chỉ cập nhật trạng thái "DA_TRA", không xóa tài sản
            setTaiSan((prev) => ({ ...prev, trangThai: "DA_TRA" }));
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
                `http://localhost:8080/api/hop-dong-thue/cancel/${localContract.id}`
            );
            alert("Hủy hợp đồng thành công!");
            navigate("/contracts");
        } catch {
            alert("Hủy hợp đồng thất bại!");
        }
    };

    // Cập nhật ngày bắt đầu (checkin)
    const handleCheckin = async () => {
        if (localContract.checkin) {
            alert("Ngày bắt đầu đã được cập nhật và không thể sửa lại!");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.put(
                `http://localhost:8080/api/hop-dong-thue/checkin/${localContract.id}`
            );
            setLocalContract({
                ...localContract,
                checkin: res.data.checkin,
                ngayBatDau: res.data.checkin, // cập nhật ngày bắt đầu hiển thị
            });
            alert("Cập nhật ngày bắt đầu thành công!");
        } catch {
            alert("Cập nhật ngày bắt đầu thất bại!");
        }
        setLoading(false);
    };

    // Cập nhật ngày kết thúc (checkout)
    const handleCheckout = async () => {
        if (localContract.checkout) {
            alert("Ngày kết thúc đã được cập nhật và không thể sửa lại!");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.put(
                `http://localhost:8080/api/hop-dong-thue/checkout/${localContract.id}`
            );
            setLocalContract({
                ...localContract,
                checkout: res.data.checkout,
                ngayKetThuc: res.data.checkout, // cập nhật ngày kết thúc hiển thị
            });
            alert("Cập nhật ngày kết thúc thành công!");
        } catch {
            alert("Cập nhật ngày kết thúc thất bại!");
        }
        setLoading(false);
    };

    // Định nghĩa thông tin các bên
    const khachHang = localContract.khachHang || {};
    const doiTac = localContract.oto?.doiTac || {};
    const xe = localContract.oto || {};

    useEffect(() => {
        if (localContract?.id && localContract?.oto?.doiTac?.id) {
            axios
                .get(
                    `http://localhost:8080/api/tai-san-cam-co/${localContract.oto.doiTac.id}`
                )
                .then((res) => {
                    // Lọc đúng tài sản cầm cố của hợp đồng này
                    const list = Array.isArray(res.data) ? res.data : [];
                    const found = list.find(
                        (ts) => ts.hopDongThue?.id === localContract.id
                    );
                    if (found) setTaiSan(found);
                })
                .catch(() => {});
        }
    }, [localContract?.id, localContract?.oto?.doiTac?.id]);

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <div
                    className="contract-header"
                    style={{ textAlign: "center", marginBottom: 16 }}
                >
                    <h3 className="contract-nation">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </h3>
                    <p className="contract-motto">
                        Độc lập - Tự do - Hạnh phúc
                    </p>
                </div>
                <h2
                    className="create-contract-title"
                    style={{ textAlign: "center" }}
                >
                    HỢP ĐỒNG THUÊ XE Ô TÔ
                </h2>
                <p className="contract-date" style={{ textAlign: "center" }}>
                    Ngày{" "}
                    {localContract.ngayBatDau
                        ? new Date(localContract.ngayBatDau).getDate()
                        : ""}{" "}
                    tháng{" "}
                    {localContract.ngayBatDau
                        ? new Date(localContract.ngayBatDau).getMonth() + 1
                        : ""}{" "}
                    năm{" "}
                    {localContract.ngayBatDau
                        ? new Date(localContract.ngayBatDau).getFullYear()
                        : ""}
                </p>
                <div style={{ marginBottom: 24 }}>
                    <b>Căn cứ:</b>
                    <ul>
                        <li>
                            Bộ luật Dân sự số 91/2015/QH13 của Quốc hội nước
                            CHXHCN Việt Nam;
                        </li>
                        <li>Nhu cầu và khả năng của các bên.</li>
                    </ul>
                </div>
                <h3 style={{ marginBottom: 8 }}>Các bên tham gia hợp đồng:</h3>
                <div className="contract-party">
                    <div className="create-contract-row">
                        <b>BÊN A (BÊN THUÊ XE):</b>
                        <span style={{ marginLeft: 8 }}>{khachHang.hoTen}</span>
                    </div>
                    <div className="create-contract-row">
                        <span>Địa chỉ:</span>
                        <span style={{ marginLeft: 8 }}>
                            {khachHang.diaChi?.soNha},{" "}
                            {khachHang.diaChi?.phuong}, {khachHang.diaChi?.quan}
                            , {khachHang.diaChi?.tinh}
                        </span>
                    </div>
                    <div className="create-contract-row">
                        <span>SĐT:</span>
                        <span style={{ marginLeft: 8 }}>
                            {khachHang.sdt || khachHang.soDienThoai}
                        </span>
                    </div>
                    <div className="create-contract-row">
                        <span>Email:</span>
                        <span style={{ marginLeft: 8 }}>{khachHang.email}</span>
                    </div>
                </div>
                <div className="contract-party" style={{ marginTop: 12 }}>
                    <div className="create-contract-row">
                        <b>BÊN B (BÊN CHO THUÊ XE - ĐỐI TÁC):</b>
                        <span style={{ marginLeft: 8 }}>{doiTac.hoTen}</span>
                    </div>
                    <div className="create-contract-row">
                        <span>Địa chỉ:</span>
                        <span style={{ marginLeft: 8 }}>
                            {doiTac.diaChi?.soNha}, {doiTac.diaChi?.phuong},{" "}
                            {doiTac.diaChi?.quan}, {doiTac.diaChi?.tinh}
                        </span>
                    </div>
                    <div className="create-contract-row">
                        <span>SĐT:</span>
                        <span style={{ marginLeft: 8 }}>{doiTac.sdt}</span>
                    </div>
                    <div className="create-contract-row">
                        <span>Email:</span>
                        <span style={{ marginLeft: 8 }}>{doiTac.email}</span>
                    </div>
                </div>
                <div className="contract-section" style={{ marginTop: 24 }}>
                    <h4>Điều 1: Thông tin xe thuê</h4>
                    <div>Biển số: {xe.bienSo}</div>
                    <div>Hãng xe: {xe.mauXe?.hangXe?.ten}</div>
                    <div>Mẫu xe: {xe.mauXe?.ten}</div>
                    <div>Số ghế: {xe.mauXe?.soGhe}</div>
                </div>
                <div className="contract-section">
                    <h4>Điều 2: Thời gian thuê và trả xe</h4>
                    <div>
                        Ngày nhận xe dự kiến:{" "}
                        {localContract.thoiGianNhan
                            ? new Date(
                                  localContract.thoiGianNhan
                              ).toLocaleString()
                            : ""}
                    </div>
                    <div>
                        Ngày trả xe dự kiến:{" "}
                        {localContract.thoiGianTra
                            ? new Date(
                                  localContract.thoiGianTra
                              ).toLocaleString()
                            : ""}
                    </div>
                    {/* Chỉ hiển thị nút cập nhật ngày bắt đầu/kết thúc nếu đối tác đã phê duyệt */}
                    <div>
                        Ngày bắt đầu hợp đồng:{" "}
                        {localContract.checkin
                            ? new Date(
                                  localContract.checkin
                              ).toLocaleDateString()
                            : isDT &&
                              isApproved && (
                                  <button
                                      className="contract-btn"
                                      onClick={handleCheckin}
                                      disabled={loading}
                                  >
                                      Cập nhật ngày bắt đầu
                                  </button>
                              )}
                    </div>
                    <div>
                        Ngày kết thúc hợp đồng:{" "}
                        {localContract.checkout
                            ? new Date(
                                  localContract.checkout
                              ).toLocaleDateString()
                            : isDT &&
                              isApproved && (
                                  <button
                                      className="contract-btn"
                                      onClick={handleCheckout}
                                      disabled={loading}
                                  >
                                      Cập nhật ngày kết thúc
                                  </button>
                              )}
                    </div>
                </div>
                <div className="contract-section">
                    <h4>Điều 3: Giá thuê và thanh toán</h4>
                    <div>
                        Giá thuê:{" "}
                        {xe.gia ? xe.gia.toLocaleString() + " VNĐ/ngày" : ""}
                    </div>
                    <div>
                        Tổng tiền thuê (ước tính):{" "}
                        {(() => {
                            let tongTien = 0;
                            if (
                                localContract.thoiGianNhan &&
                                localContract.thoiGianTra &&
                                xe.gia
                            ) {
                                const nhan = new Date(
                                    localContract.thoiGianNhan
                                );
                                const tra = new Date(localContract.thoiGianTra);
                                let soNgay = Math.ceil(
                                    (tra - nhan) / (1000 * 60 * 60 * 24)
                                );
                                if (soNgay < 1) soNgay = 1;
                                tongTien = soNgay * xe.gia;
                            }
                            return tongTien > 0
                                ? tongTien.toLocaleString() + " VNĐ"
                                : "";
                        })()}{" "}
                        (Chưa bao gồm phụ phí nếu có)
                    </div>
                    <div>Hình thức thanh toán: Tiền mặt hoặc chuyển khoản.</div>
                </div>
                <div className="contract-section">
                    <h4>Điều 4: Quyền và nghĩa vụ của các bên</h4>
                    <ul>
                        <li>
                            <b>Bên A (Khách hàng):</b> Sử dụng xe đúng mục đích,
                            giữ gìn xe cẩn thận, thanh toán đầy đủ và đúng hạn,
                            trả xe đúng thời gian.
                        </li>
                        <li>
                            <b>Bên B (Đối tác):</b> Đảm bảo xe đúng mô tả, tình
                            trạng kỹ thuật tốt, giao xe đúng thời gian, hỗ trợ
                            khách hàng khi cần thiết.
                        </li>
                        <li>
                            Hai bên cùng tuân thủ pháp luật Việt Nam và các điều
                            khoản hợp đồng.
                        </li>
                    </ul>
                </div>
                <div className="contract-section">
                    <h4>Điều 5: Chấm dứt hợp đồng</h4>
                    <ul>
                        <li>
                            Hợp đồng chấm dứt khi hết thời hạn thuê hoặc hai bên
                            thỏa thuận chấm dứt sớm.
                        </li>
                        <li>
                            Một trong hai bên có quyền đơn phương chấm dứt hợp
                            đồng nếu bên kia vi phạm nghiêm trọng điều khoản hợp
                            đồng.
                        </li>
                    </ul>
                </div>
                <div className="contract-section">
                    <h4>Điều 6: Điều khoản chung</h4>
                    <ul>
                        <li>
                            Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản
                            và có giá trị pháp lý như nhau.
                        </li>
                        <li>
                            Hai bên cam kết thực hiện đúng các điều khoản đã ghi
                            trong hợp đồng.
                        </li>
                    </ul>
                </div>
                <div className="contract-section">
                    <h4>Tài sản cầm cố</h4>
                    {taiSan ? (
                        <div>
                            <div>Loại tài sản: {taiSan.loaiTaiSan}</div>
                            <div>
                                Giá trị: {taiSan.gia?.toLocaleString()}{" "}
                                VNĐ
                            </div>
                            <div>Mô tả: {taiSan.moTa}</div>
                            <div>
                                Thời gian nhận:{" "}
                                {taiSan.thoiGianNhan
                                    ? new Date(
                                          taiSan.thoiGianNhan
                                      ).toLocaleString()
                                    : ""}
                            </div>
                            <div>
                                Trạng thái:{" "}
                                <span
                                    style={{
                                        padding: "2px 10px",
                                        borderRadius: 8,
                                        fontWeight: 500,
                                        background:
                                            taiSan.trangThai === "DA_NHAN"
                                                ? "#bbf7d0"
                                                : taiSan.trangThai === "DA_TRA"
                                                ? "#fde68a"
                                                : "#e0e7ef",
                                        color:
                                            taiSan.trangThai === "DA_NHAN"
                                                ? "#166534"
                                                : taiSan.trangThai === "DA_TRA"
                                                ? "#b45309"
                                                : "#334155",
                                    }}
                                >
                                    {taiSan.trangThai === "DA_NHAN"
                                        ? "Đã nhận"
                                        : taiSan.trangThai === "DA_TRA"
                                        ? "Đã trả"
                                        : taiSan.trangThai || ""}
                                </span>
                            </div>
                            {/* Chỉ hiển thị nút trả tài sản nếu đã phê duyệt và trạng thái là "DA_NHAN" */}
                            {isDT &&
                                isApproved &&
                                taiSan.trangThai === "DA_NHAN" && (
                                    <button
                                        className="contract-btn"
                                        style={{
                                            marginTop: 12,
                                            background: "#0ea5e9",
                                        }}
                                        onClick={handleTraTaiSan}
                                        disabled={xacNhanLoading}
                                    >
                                        Trả tài sản cầm cố
                                    </button>
                                )}
                        </div>
                    ) : (
                        isDT &&
                        isApproved && (
                            <button
                                className="contract-btn"
                                onClick={() => setShowModal(true)}
                            >
                                Thêm tài sản cầm cố
                            </button>
                        )
                    )}
                </div>
                <div className="contract-signatures" style={{ marginTop: 32 }}>
                    <div className="signature-section">
                        <h4>ĐẠI DIỆN CÁC BÊN</h4>
                        <div className="signature-row">
                            <div className="signature-column">
                                <p>
                                    <strong>
                                        BÊN A<br />
                                        (Khách hàng)
                                    </strong>
                                </p>
                                <p>{khachHang.hoTen || "________________"}</p>
                            </div>
                            <div className="signature-column">
                                <p>
                                    <strong>
                                        BÊN B<br />
                                        (Đối tác)
                                    </strong>
                                </p>
                                <p>{doiTac.hoTen || "________________"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Các nút hành động */}
                <div className="contract-detail-actions">
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
                    {isDT && localContract.trangThai === "CHO_DUYET" && (
                        <button
                            className="contract-btn contract-btn-approve"
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            Phê duyệt hợp đồng
                        </button>
                    )}
                    {isDT && localContract.trangThai === "OK" && (
                        <button
                            className="contract-btn contract-btn-liquidate"
                            onClick={handleLiquidate}
                            disabled={loading}
                        >
                            Thanh lý hợp đồng
                        </button>
                    )}
                </div>
                {/* Nút đề xuất danh sách đen cho hợp đồng đã hết hạn */}
                {localContract.trangThai === "HET_HAN_HOP_DONG" && (
                    <div style={{ marginTop: 32, textAlign: "center" }}>
                        <button
                            className="contract-btn"
                            style={{ background: "#991b1b", color: "#fff" }}
                            onClick={() => setShowSuggestBlackListModal(true)}
                        >
                            Đề xuất thêm vào danh sách đen
                        </button>
                    </div>
                )}
            </div>
            <Footer />
            {/* Modal đề xuất danh sách đen */}
            {showSuggestBlackListModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ minWidth: 400 }}>
                        <h3>Đề xuất thêm vào danh sách đen</h3>
                        <div>
                            <b>Khách hàng:</b> {localContract.khachHang?.hoTen}
                        </div>
                        <div>
                            <b>Ngày thêm:</b> {new Date().toLocaleString()}
                        </div>
                        <div style={{ margin: "12px 0" }}>
                            <label>Lý do:</label>
                            <textarea
                                value={suggestReason}
                                onChange={(e) =>
                                    setSuggestReason(e.target.value)
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
                            onClick={handleSuggestBlackList}
                            disabled={suggestLoading || !suggestReason}
                        >
                            Xác nhận đề xuất
                        </button>
                        <button
                            className="contract-btn"
                            style={{ marginLeft: 12 }}
                            onClick={() => setShowSuggestBlackListModal(false)}
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            )}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Thêm tài sản cầm cố</h3>
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
                                    <option value="Hiện vật">Hiện vật</option>
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
                                    value={moTaTaiSan.toLocaleString()}
                                    onChange={(e) =>
                                        setMoTaTaiSan(
                                            e.target.value.toLocaleString()
                                        )
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
        </div>
    );
}

export default ContractDetailPage;
