import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/css/CarRegisterForm.css";
import Modal from "./Modal";

function CarRegisterForm() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [step, setStep] = useState(1);
    // Thêm state cho hình ảnh
    const [images, setImages] = useState([]);
    // Thêm state cho thuộc tính ảnh
    const [imageMeta, setImageMeta] = useState([
        // Mặc định cho 5 ảnh, có thể mở rộng
        { giayToXe: false, thumnail: false, ghiChu: "" },
        { giayToXe: false, thumnail: false, ghiChu: "" },
        { giayToXe: false, thumnail: false, ghiChu: "" },
        { giayToXe: false, thumnail: false, ghiChu: "" },
        { giayToXe: false, thumnail: false, ghiChu: "" },
    ]);
    const [form, setForm] = useState({
        bienSo: "",
        hangXe: "",
        mauXe: "",
        soGhe: "",
        namSX: "",
        truyenDong: "",
        nhienLieu: "",
        mucTieuThu: "",
        moTa: "",
        diaChi: "",
        tinhNang: [],
    });
    const [giaThue, setGiaThue] = useState("");

    // Địa chỉ modal state
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [address, setAddress] = useState({
        tinh: "",
        quan: "",
        phuong: "",
        soNha: "",
    });

    // Hãng xe và mẫu xe từ API
    const [hangXeOptions, setHangXeOptions] = useState([]);
    const [mauXeOptions, setMauXeOptions] = useState([]);
    // Số ghế từ 4 đến 13
    const soGheOptions = Array.from({ length: 10 }, (_, i) => i + 4);
    // Năm sản xuất từ 2007 đến 2025
    const namSXOptions = Array.from(
        { length: 2025 - 2007 + 1 },
        (_, i) => 2025 - i
    );
    const truyenDongOptions = ["Số sàn", "Số tự động"];
    const nhienLieuOptions = ["Xăng", "Điện"];

    // Dữ liệu tỉnh/huyện/xã từ API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const tinhObj = provinces.find(
        (p) => String(p.code) === String(address.tinh)
    );
    const quanObj = districts.find(
        (d) => String(d.code) === String(address.quan)
    );
    const phuongObj = wards.find(
        (w) => String(w.code) === String(address.phuong)
    );

    // Lấy danh sách hãng xe khi load trang
    useEffect(() => {
        axios
            .get("http://localhost:8080/hang-xe")
            .then((res) => setHangXeOptions(res.data))
            .catch(() => setHangXeOptions([]));
    }, []);

    // Lấy danh sách mẫu xe khi chọn hãng xe
    useEffect(() => {
        if (form.hangXe) {
            axios
                .get(`http://localhost:8080/mau-xe/hang-xe-${form.hangXe}`)
                .then((res) => setMauXeOptions(res.data))
                .catch(() => setMauXeOptions([]));
        } else {
            setMauXeOptions([]);
        }
    }, [form.hangXe]);

    // Lấy danh sách tỉnh khi mở modal
    useEffect(() => {
        if (showAddressModal && provinces.length === 0) {
            axios
                .get("https://provinces.open-api.vn/api/p/")
                .then((res) => setProvinces(res.data))
                .catch(() => setProvinces([]));
        }
    }, [showAddressModal, provinces.length]);

    // Lấy danh sách huyện khi chọn tỉnh
    useEffect(() => {
        if (address.tinh) {
            axios
                .get(
                    `https://provinces.open-api.vn/api/p/${address.tinh}?depth=2`
                )
                .then((res) => setDistricts(res.data.districts || []))
                .catch(() => setDistricts([]));
            setAddress((addr) => ({ ...addr, quan: "", phuong: "" }));
            setWards([]);
        }
    }, [address.tinh]);

    // Lấy danh sách xã khi chọn huyện
    useEffect(() => {
        if (address.quan) {
            axios
                .get(
                    `https://provinces.open-api.vn/api/d/${address.quan}?depth=2`
                )
                .then((res) => setWards(res.data.wards || []))
                .catch(() => setWards([]));
            setAddress((addr) => ({ ...addr, phuong: "" }));
        }
    }, [address.quan]);

    // Khi chọn mẫu xe, tự động set số ghế theo mẫu xe nhưng vẫn cho chỉnh sửa
    useEffect(() => {
        if (form.mauXe && mauXeOptions.length > 0) {
            const selectedMauXe = mauXeOptions.find(
                (m) => String(m.id) === String(form.mauXe)
            );
            if (selectedMauXe && selectedMauXe.soGhe) {
                setForm((prev) => ({
                    ...prev,
                    soGhe: String(selectedMauXe.soGhe),
                }));
            }
        }
    }, [form.mauXe, mauXeOptions]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleAddressChange(e) {
        const { name, value } = e.target;
        setAddress((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "tinh" ? { quan: "", phuong: "" } : {}),
            ...(name === "quan" ? { phuong: "" } : {}),
        }));
    }

    function handleApplyAddress() {
        // Ghép địa chỉ đầy đủ
        const diaChiStr = [
            address.soNha,
            phuongObj?.name,
            quanObj?.name,
            tinhObj?.name,
        ]
            .filter(Boolean)
            .join(", ");
        setForm((f) => ({ ...f, diaChi: diaChiStr }));
        setShowAddressModal(false);
    }

    // Danh sách tính năng mặc định, id từ 1 đến 18
    const featuresList = [
        {
            id: 1,
            key: "banDo",
            label: "Bản đồ",
            icon: <i className="fa-regular fa-map"></i>,
        },
        {
            id: 2,
            key: "bluetooth",
            label: "Bluetooth",
            icon: <i className="fa-brands fa-bluetooth-b"></i>,
        },
        {
            id: 3,
            key: "camera360",
            label: "Camera 360",
            icon: <i className="fa-regular fa-camera"></i>,
        },
        {
            id: 4,
            key: "cameraCapLe",
            label: "Camera cặp lề",
            icon: <i className="fa-regular fa-video"></i>,
        },
        {
            id: 5,
            key: "cameraHanhTrinh",
            label: "Camera hành trình",
            icon: <i className="fa-regular fa-video"></i>,
        },
        {
            id: 6,
            key: "cameraLui",
            label: "Camera lùi",
            icon: <i className="fa-regular fa-video"></i>,
        },
        {
            id: 7,
            key: "camBienLop",
            label: "Cảm biến lốp",
            icon: <i className="fa-solid fa-tachometer-alt"></i>,
        },
        {
            id: 8,
            key: "camBienVaCham",
            label: "Cảm biến va chạm",
            icon: <i className="fa-solid fa-car-burst"></i>,
        },
        {
            id: 9,
            key: "canhBaoTocDo",
            label: "Cảnh báo tốc độ",
            icon: <i className="fa-solid fa-gauge-high"></i>,
        },
        {
            id: 10,
            key: "cuaSoTroi",
            label: "Cửa sổ trời",
            icon: <i className="fa-regular fa-square"></i>,
        },
        {
            id: 11,
            key: "dinhViGPS",
            label: "Định vị GPS",
            icon: <i className="fa-solid fa-location-dot"></i>,
        },
        {
            id: 12,
            key: "gheTreEm",
            label: "Ghế trẻ em",
            icon: <i className="fa-solid fa-baby-carriage"></i>,
        },
        {
            id: 13,
            key: "kheCamUSB",
            label: "Khe cắm USB",
            icon: <i className="fa-solid fa-usb"></i>,
        },
        {
            id: 14,
            key: "lopDuPhong",
            label: "Lốp dự phòng",
            icon: <i className="fa-solid fa-circle-dot"></i>,
        },
        {
            id: 15,
            key: "manHinhDVD",
            label: "Màn hình DVD",
            icon: <i className="fa-solid fa-tv"></i>,
        },
        {
            id: 16,
            key: "napThungBanTai",
            label: "Nắp thùng xe bán tải",
            icon: <i className="fa-solid fa-truck-pickup"></i>,
        },
        {
            id: 17,
            key: "etc",
            label: "ETC",
            icon: <i className="fa-solid fa-credit-card"></i>,
        },
        {
            id: 18,
            key: "tuiKhiAnToan",
            label: "Túi khí an toàn",
            icon: <i className="fa-solid fa-circle-exclamation"></i>,
        },
    ];
    function handlePrev() {
        setStep(step - 1);
    }

    // format giá thuê
    function formatCurrency(value) {
        return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Tạo xe (chỉ gọi khi nhấn "Tiếp tục" ở bước thông tin)
    async function handleCreateCar() {
        try {
            const selectedFeatureIds = form.tinhNang
                .map((key) => featuresList.find((f) => f.key === key)?.id)
                .filter(Boolean);

            const payload = {
                bienSo: form.bienSo,
                mauXeId: Number(form.mauXe),
                moTa: form.moTa,
                loaiNhienLieu: form.nhienLieu,
                mucTieuThu: form.mucTieuThu,
                namSanXuat: Number(form.namSX),
                truyenDong: form.truyenDong,
                soGhe: Number(form.soGhe),
                doiTacId: user.id,
                diaChi: {
                    tinh: tinhObj?.name || "",
                    quan: quanObj?.name || "",
                    phuong: phuongObj?.name || "",
                    soNha: address.soNha,
                },
                tienNghi: selectedFeatureIds,
            };

            // Tạo xe trước, lưu lại otoId vào state
            const res = await axios.post("http://localhost:8080/cars", payload);
            console.log("reSL: ", JSON.stringify(res.data));
            const otoId = res.data.id;
            const diaChiId = res.data.diaChi.id;
            setForm((f) => ({ ...f, otoId, diaChiId })); // lưu id xe vào state
            setStep(2); // chuyển sang bước nhập giá thuê
        } catch (err) {
            alert("Đăng ký xe thất bại!" + err.message);
        }
    }

    function handleImageMetaChange(idx, field, value) {
        setImageMeta((prev) =>
            prev.map((meta, i) =>
                i === idx ? { ...meta, [field]: value } : meta
            )
        );
    }

    // Upload ảnh (gửi kèm meta)
    async function handleUploadImages() {
        try {
            const otoId = form.otoId;
            if (!otoId) {
                alert("Vui lòng điền thông tin xe trước khi upload ảnh!");
                return;
            }
            for (let i = 0; i < images.length && i < 5; i++) {
                const formData = new FormData();
                formData.append("file", images[i]);
                // Đúng chuẩn backend: truyền JSON string cho anhCuaXeRequestDto
                const meta = {
                    giayToXe: imageMeta[i]?.giayToXe || false,
                    thumnail: imageMeta[i]?.thumnail || false,
                    ghiChu: imageMeta[i]?.ghiChu || "",
                };
                formData.append(
                    "anhCuaXeRequestDto",
                    new Blob([JSON.stringify(meta)], {
                        type: "application/json",
                    })
                );
                await axios.post(
                    `http://localhost:8080/image-of-car/uploads/${otoId}`,
                    formData
                );
            }
            alert("Đăng ký xe thành công!");
            navigate("/partner_cars");
        } catch (err) {
            alert("Upload ảnh thất bại! " + err.message);
        }
    }

    // Xử lý chọn hình ảnh, chỉ cho phép tối đa 5 ảnh
    function handleImageChange(e) {
        const files = Array.from(e.target.files);
        setImages((prev) => {
            const newFiles = files.slice(0, 5 - prev.length); // chỉ lấy đủ 5 ảnh
            return [...prev, ...newFiles].slice(0, 5);
        });
    }

    // xử lý nhập giá thuê
    function handleGiaThueChange(e) {
        setGiaThue(formatCurrency(e.target.value));
    }

    // Xóa hình đã chọn
    function handleRemoveImage(index) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleUpdateGiaThue() {
        try {
            const otoId = form.otoId;
            if (!otoId) {
                alert("Vui lòng đăng ký xe trước!");
                return;
            }
            // Map tiện nghi từ key sang id
            const tienNghiIds = (form.tinhNang || [])
                .map((key) => {
                    const found = featuresList.find((f) => f.key === key);
                    return found ? found.id : null;
                })
                .filter((id) => id !== null);

            const diaChiId = form.diaChiId;

            const payloadUpdate = {
                bienSo: form.bienSo,
                mauXeId: Number(form.mauXe),
                moTa: form.moTa,
                loaiNhienLieu: form.nhienLieu,
                mucTieuThu: form.mucTieuThu,
                namSanXuat: Number(form.namSX),
                truyenDong: form.truyenDong,
                soGhe: Number(form.soGhe),
                trangThai: "CHO_DUYET",
                gia: parseFloat(giaThue.replace(/,/g, "")),
                doiTacId: user.id,
                diaChi: {
                    id: diaChiId,
                    tinh: tinhObj?.name || "",
                    quan: quanObj?.name || "",
                    phuong: phuongObj?.name || "",
                    soNha: address.soNha,
                },
                tienNghi: tienNghiIds,
            };
            await axios.put(
                `http://localhost:8080/cars/${otoId}`,
                payloadUpdate
            );
            setStep(3);
        } catch (err) {
            alert("Cập nhật giá thuê thất bại! " + err.message);
        }
    }

    return (
        <div className="register-form-container">
            {/* Stepper */}
            <div className="register-stepper">
                <div className={`register-step ${step === 1 ? "active" : ""}`}>
                    1
                </div>
                <span>&gt;</span>
                <div className={`register-step ${step === 2 ? "active" : ""}`}>
                    2
                </div>
                <span>&gt;</span>
                <div className={`register-step ${step === 3 ? "active" : ""}`}>
                    3
                </div>
            </div>
            <div className="register-step-labels">
                <span className={step === 1 ? "active" : ""}>Thông tin</span>
                <span className={step === 2 ? "active" : ""}>Cho thuê</span>
                <span className={step === 3 ? "active" : ""}>Hình ảnh</span>
            </div>
            <hr />

            {/* Step 1: Thông tin */}
            {step === 1 && (
                <div className="register-form-step">
                    <div className="register-form-group">
                        <label>Biển số xe</label>
                        <div className="register-form-note">
                            Lưu ý: Biển số sẽ không thể thay đổi sau khi đăng
                            ký.
                        </div>
                        <input
                            name="bienSo"
                            value={form.bienSo}
                            onChange={handleChange}
                            className="register-form-input"
                        />
                    </div>
                    <div className="register-form-group">
                        <label>Thông tin cơ bản</label>
                        <div className="register-form-note">
                            Lưu ý: Các thông tin cơ bản sẽ không thể thay đổi
                            sau khi đăng ký.
                        </div>
                        <div className="register-form-row">
                            <div>
                                <div>Hãng xe</div>
                                <select
                                    name="hangXe"
                                    value={form.hangXe}
                                    onChange={handleChange}
                                >
                                    <option value="">Chọn hãng xe</option>
                                    {hangXeOptions.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.ten}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div>Mẫu xe</div>
                                <select
                                    name="mauXe"
                                    value={form.mauXe}
                                    onChange={handleChange}
                                    disabled={!form.hangXe}
                                >
                                    <option value="">Chọn hãng xe trước</option>
                                    {mauXeOptions.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.tenMauXe}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="register-form-row">
                            <div>
                                <div>Số ghế</div>
                                <select
                                    name="soGhe"
                                    value={form.soGhe}
                                    onChange={handleChange}
                                >
                                    <option value="">Chọn số ghế</option>
                                    {/* Nếu đã chọn mẫu xe, hiển thị số ghế mặc định đầu tiên */}
                                    {form.mauXe && mauXeOptions.length > 0
                                        ? (() => {
                                              const selectedMauXe =
                                                  mauXeOptions.find(
                                                      (m) =>
                                                          String(m.id) ===
                                                          String(form.mauXe)
                                                  );
                                              const defaultSoGhe =
                                                  selectedMauXe?.soGhe;
                                              const otherOptions =
                                                  soGheOptions.filter(
                                                      (s) =>
                                                          String(s) !==
                                                          String(defaultSoGhe)
                                                  );
                                              return [
                                                  <option
                                                      key={defaultSoGhe}
                                                      value={defaultSoGhe}
                                                  >
                                                      {defaultSoGhe} (mặc định
                                                      mẫu xe)
                                                  </option>,
                                                  ...otherOptions.map((s) => (
                                                      <option key={s} value={s}>
                                                          {s}
                                                      </option>
                                                  )),
                                              ];
                                          })()
                                        : soGheOptions.map((s) => (
                                              <option key={s} value={s}>
                                                  {s}
                                              </option>
                                          ))}
                                </select>
                            </div>
                            <div>
                                <div>Năm sản xuất</div>
                                <select
                                    name="namSX"
                                    value={form.namSX}
                                    onChange={handleChange}
                                >
                                    <option value="">Chọn năm</option>
                                    {namSXOptions.map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="register-form-row">
                            <div>
                                <div>Truyền động</div>
                                <select
                                    name="truyenDong"
                                    value={form.truyenDong}
                                    onChange={handleChange}
                                >
                                    <option value="">Chọn truyền động</option>
                                    {truyenDongOptions.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div>Loại nhiên liệu</div>
                                <select
                                    name="nhienLieu"
                                    value={form.nhienLieu}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        Chọn loại nhiên liệu
                                    </option>
                                    {nhienLieuOptions.map((l) => (
                                        <option key={l} value={l}>
                                            {l}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* --- Mức tiêu thụ nhiên liệu --- */}
                    <div className="register-form-group">
                        <label htmlFor="mucTieuThu" className="register-label">
                            Mức tiêu thụ nhiên liệu
                        </label>
                        <div className="register-form-note">
                            Số lít nhiên liệu cho quãng đường 100km.
                        </div>
                        <input
                            id="mucTieuThu"
                            name="mucTieuThu"
                            type="number"
                            min="0"
                            step="0.1"
                            className="register-form-input"
                            value={form.mucTieuThu || ""}
                            onChange={handleChange}
                            placeholder="10"
                        />
                    </div>

                    {/* --- Mô tả --- */}
                    <div className="register-form-group">
                        <label htmlFor="moTa" className="register-label">
                            Mô tả
                        </label>
                        <textarea
                            id="moTa"
                            name="moTa"
                            className="register-form-input"
                            rows={3}
                            value={form.moTa || ""}
                            onChange={handleChange}
                            placeholder="Nhập mô tả về xe của bạn..."
                            style={{ resize: "vertical" }}
                        />
                    </div>

                    {/* Địa chỉ */}
                    <div className="register-form-group">
                        <label>Địa chỉ xe</label>
                        <button
                            type="button"
                            className="register-address-btn"
                            onClick={() => setShowAddressModal(true)}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: 6,
                                background: "#fafafa",
                                marginBottom: 8,
                                cursor: "pointer",
                            }}
                        >
                            {form.diaChi ? form.diaChi : "Chọn địa chỉ"}
                        </button>
                    </div>

                    {/* Modal địa chỉ */}
                    <Modal
                        open={showAddressModal}
                        onClose={() => setShowAddressModal(false)}
                        width={370}
                    >
                        <h3 style={{ textAlign: "center", marginBottom: 20 }}>
                            Chỉnh sửa địa chỉ
                        </h3>
                        <div style={{ marginBottom: 16 }}>
                            <label>Tỉnh/ Thành phố</label>
                            <select
                                name="tinh"
                                value={address.tinh}
                                onChange={handleAddressChange}
                                style={{
                                    width: "100%",
                                    padding: 8,
                                    marginTop: 4,
                                }}
                            >
                                <option value="">Chọn thành phố</option>
                                {provinces.map((t) => (
                                    <option key={t.code} value={t.code}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Quận/ Huyện</label>
                            <select
                                name="quan"
                                value={address.quan}
                                onChange={handleAddressChange}
                                disabled={!address.tinh}
                                style={{
                                    width: "100%",
                                    padding: 8,
                                    marginTop: 4,
                                }}
                            >
                                <option value="">Chọn thành phố trước</option>
                                {districts.map((q) => (
                                    <option key={q.code} value={q.code}>
                                        {q.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Phường/ Xã</label>
                            <select
                                name="phuong"
                                value={address.phuong}
                                onChange={handleAddressChange}
                                disabled={!address.quan}
                                style={{
                                    width: "100%",
                                    padding: 8,
                                    marginTop: 4,
                                }}
                            >
                                <option value="">Chọn quận huyện trước</option>
                                {wards.map((p) => (
                                    <option key={p.code} value={p.code}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Đường</label>
                            <input
                                name="soNha"
                                value={address.soNha}
                                onChange={handleAddressChange}
                                placeholder="Nhập tên đường / tòa nhà"
                                style={{
                                    width: "100%",
                                    padding: 8,
                                    marginTop: 4,
                                }}
                            />
                        </div>
                        <button
                            className="register-form-btn"
                            style={{ width: "100%", marginBottom: 8 }}
                            onClick={handleApplyAddress}
                            type="button"
                            disabled={
                                !address.tinh ||
                                !address.quan ||
                                !address.phuong
                            }
                        >
                            Áp dụng
                        </button>
                        <button
                            className="register-form-btn"
                            style={{
                                width: "100%",
                                background: "#eee",
                                color: "#333",
                            }}
                            onClick={() => setShowAddressModal(false)}
                            type="button"
                        >
                            Hủy bỏ
                        </button>
                    </Modal>

                    {/* --- Tính năng --- */}
                    <div className="register-form-group">
                        <label className="register-label">Tính năng</label>
                        <div
                            className="register-features-list"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 12,
                            }}
                        >
                            {featuresList.map((feature) => (
                                <button
                                    type="button"
                                    key={feature.key}
                                    className={`register-feature-btn${
                                        form.tinhNang?.includes(feature.key)
                                            ? " selected"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setForm((f) => ({
                                            ...f,
                                            tinhNang: f.tinhNang?.includes(
                                                feature.key
                                            )
                                                ? f.tinhNang.filter(
                                                      (k) => k !== feature.key
                                                  )
                                                : [
                                                      ...(f.tinhNang || []),
                                                      feature.key,
                                                  ],
                                        }));
                                    }}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: form.tinhNang?.includes(
                                            feature.key
                                        )
                                            ? "2px solid #22c55e"
                                            : "1px solid #ccc",
                                        background: "#fff",
                                        borderRadius: 8,
                                        padding: "18px 0 10px 0",
                                        fontWeight: 500,
                                        color: "#222",
                                        cursor: "pointer",
                                        transition: "border 0.2s",
                                        minHeight: 70,
                                    }}
                                >
                                    <div
                                        className="register-feature-icon"
                                        style={{
                                            fontSize: 24,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <div>{feature.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="register-form-actions">
                        <button
                            className="register-form-btn"
                            onClick={handleCreateCar}
                            disabled={
                                !form.bienSo ||
                                !form.hangXe ||
                                !form.mauXe ||
                                !form.soGhe ||
                                !form.namSX ||
                                !form.truyenDong ||
                                !form.nhienLieu
                            }
                        >
                            Tiếp tục
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Giá cho thuê */}
            {step === 2 && (
                <div className="register-form-step">
                    <div className="register-form-group">
                        <label>Giá cho thuê</label>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <input
                                type="text"
                                value={giaThue}
                                onChange={handleGiaThueChange}
                                placeholder="Nhập giá cho thuê"
                                className="register-form-input"
                                style={{ flex: 1 }}
                            />
                            <span>VNĐ</span>
                        </div>
                    </div>
                    <div className="register-form-actions">
                        <button
                            className="register-form-btn"
                            style={{
                                background: "#fff",
                                color: "#22c55e",
                                border: "1px solid #22c55e",
                            }}
                            onClick={handlePrev}
                        >
                            Quay lại
                        </button>
                        <button
                            className="register-form-btn"
                            onClick={handleUpdateGiaThue}
                            disabled={!giaThue}
                        >
                            Tiếp tục
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Hình ảnh */}
            {step === 3 && (
                <div className="register-form-step">
                    <h2>Hình ảnh</h2>
                    <div style={{ marginBottom: 8 }}>
                        Đăng nhiều hình ở các góc độ khác nhau để tăng thông tin
                        cho xe của bạn.
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        {/* Hiển thị ảnh đã chọn */}
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                style={{
                                    position: "relative",
                                    width: 120,
                                    height: 120,
                                    marginBottom: 12,
                                }}
                            >
                                <img
                                    src={URL.createObjectURL(img)}
                                    alt="car"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        border: "1px solid #eee",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    style={{
                                        position: "absolute",
                                        top: 2,
                                        right: 2,
                                        background: "#fff",
                                        border: "1px solid #ccc",
                                        borderRadius: "50%",
                                        width: 24,
                                        height: 24,
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                    title="Xóa"
                                >
                                    ×
                                </button>
                                {/* Thuộc tính ảnh */}
                                <div className="car-image-meta">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={
                                                imageMeta[idx]?.giayToXe ||
                                                false
                                            }
                                            onChange={(e) =>
                                                handleImageMetaChange(
                                                    idx,
                                                    "giayToXe",
                                                    e.target.checked
                                                )
                                            }
                                        />{" "}
                                        Giấy tờ xe
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={
                                                imageMeta[idx]?.thumnail ||
                                                false
                                            }
                                            onChange={(e) =>
                                                handleImageMetaChange(
                                                    idx,
                                                    "thumnail",
                                                    e.target.checked
                                                )
                                            }
                                        />{" "}
                                        Ảnh đại diện
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ghi chú"
                                        value={imageMeta[idx]?.ghiChu || ""}
                                        onChange={(e) =>
                                            handleImageMetaChange(
                                                idx,
                                                "ghiChu",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                        {/* Nút chọn hình */}
                        {images.length < 5 && (
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 180,
                                    height: 180,
                                    background: "#f8fafc",
                                    borderRadius: 12,
                                    cursor: "pointer",
                                    border: "1px dashed #b5e4c7",
                                    marginBottom: 12,
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                    disabled={images.length >= 5}
                                />
                                <span
                                    style={{
                                        background: "#4ade80",
                                        color: "#fff",
                                        padding: "10px 24px",
                                        borderRadius: 24,
                                        fontWeight: 500,
                                        fontSize: 16,
                                        marginBottom: 0,
                                        cursor: "pointer",
                                    }}
                                >
                                    CHỌN HÌNH
                                </span>
                            </label>
                        )}
                    </div>
                    <div
                        style={{
                            color: "#888",
                            fontSize: 13,
                            marginBottom: 20,
                            paddingTop: 50,
                        }}
                    >
                        {images.length}/5 ảnh (tối đa 5 ảnh)
                    </div>
                    <div className="register-form-actions">
                        <button
                            className="register-form-btn"
                            style={{
                                background: "#fff",
                                color: "#22c55e",
                                border: "1px solid #22c55e",
                            }}
                            onClick={() => setStep(1)}
                        >
                            Quay lại
                        </button>
                        <button
                            className="register-form-btn"
                            style={{ opacity: images.length === 0 ? 0.5 : 1 }}
                            disabled={images.length === 0}
                            onClick={handleUploadImages}
                        >
                            Đăng ký
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CarRegisterForm;
