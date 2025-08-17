import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const viTriList = ["Khách hàng", "Đối tác", "Nhân viên", "Quản lý"];

function SignUpForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        password: "",
        hoTen: "",
        sdt: "",
        email: "",
        tinh: "",
        quan: "",
        phuong: "",
        soNha: "",
        viTri: "",
    });
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    function handleChange(e) {
        const { name, value } = e.target;
        // Nếu chọn tỉnh, lưu cả tên tỉnh
        if (name === "tinh") {
            const tinhObj = provinces.find(
                (p) => String(p.code) === String(value)
            );
            setForm((prev) => ({
                ...prev,
                tinh: value,
                tenTinh: tinhObj ? tinhObj.name : "",
                quan: "",
                tenQuan: "",
                phuong: "",
                tenPhuong: "",
            }));
        }
        // Nếu chọn quận, lưu cả tên quận
        else if (name === "quan") {
            const quanObj = districts.find(
                (d) => String(d.code) === String(value)
            );
            setForm((prev) => ({
                ...prev,
                quan: value,
                tenQuan: quanObj ? quanObj.name : "",
                phuong: "",
                tenPhuong: "",
            }));
        }
        // Nếu chọn phường, lưu cả tên phường
        else if (name === "phuong") {
            const phuongObj = wards.find(
                (w) => String(w.code) === String(value)
            );
            setForm((prev) => ({
                ...prev,
                phuong: value,
                tenPhuong: phuongObj ? phuongObj.name : "",
            }));
        }
        // Trường khác giữ nguyên
        else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    }

    // Lấy danh sách tỉnh khi mở modal
    useEffect(() => {
        if (provinces.length === 0) {
            axios
                .get("https://provinces.open-api.vn/api/p/")
                .then((res) => setProvinces(res.data))
                .catch(() => setProvinces([]));
        }
    }, [provinces.length]);

    // Lấy danh sách huyện khi chọn tỉnh
    useEffect(() => {
        if (form.tinh) {
            axios
                .get(`https://provinces.open-api.vn/api/p/${form.tinh}?depth=2`)
                .then((res) => setDistricts(res.data.districts || []))
                .catch(() => setDistricts([]));
            setForm((form) => ({ ...form, quan: "", phuong: "" }));
            setWards([]);
        }
    }, [form.tinh]);
    console.log(form.tinh);

    // Lấy danh sách xã khi chọn huyện
    useEffect(() => {
        if (form.quan) {
            axios
                .get(`https://provinces.open-api.vn/api/d/${form.quan}?depth=2`)
                .then((res) => setWards(res.data.wards || []))
                .catch(() => setWards([]));
            setForm((form) => ({ ...form, phuong: "" }));
        }
    }, [form.quan]);
    console.log(JSON.stringify(form));

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setShowSuccess("true");
        try {
            // Chỉ gửi tên tỉnh, quận, phường
            const payload = {
                username: form.username,
                password: form.password,
                hoTen: form.hoTen,
                sdt: form.sdt,
                email: form.email,
                soNha: form.soNha,
                viTri: form.viTri,
                tinh: form.tenTinh || "",
                quan: form.tenQuan || "",
                phuong: form.tenPhuong || "",
            };
            await axios.post(
                "http://localhost:8080/api/auth/register",
                payload
            );
            setShowSuccess(true);
            setForm({
                username: "",
                password: "",
                hoTen: "",
                sdt: "",
                email: "",
                tinh: "",
                quan: "",
                phuong: "",
                soNha: "",
                viTri: "",
                tenTinh: "",
                tenQuan: "",
                tenPhuong: "",
            });
            setTimeout(() => {
                setShowSuccess(false);
                navigate("/login");
            }, 1500);
        } catch (err) {
            setError(
                err.response?.data?.message || err.message || "Đăng ký thất bại"
            );
        }
    }

    return (
        <div style={{ position: "relative" }}>
            {/* Snackbar thông báo thành công */}
            {showSuccess && (
                <div
                    style={{
                        position: "fixed",
                        top: 24,
                        right: 24,
                        background: "#4caf50",
                        color: "#fff",
                        padding: "16px 32px",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px #aaa",
                        zIndex: 9999,
                        fontWeight: 600,
                        fontSize: 18,
                        transition: "all 0.3s",
                    }}
                >
                    Đăng ký thành công! Đang chuyển sang trang đăng nhập...
                </div>
            )}
            <form
                onSubmit={handleSubmit}
                style={{
                    width: 400,
                    background: "#fff",
                    padding: 32,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px #eee",
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: 24 }}>
                    Đăng ký tài khoản
                </h2>
                <div style={{ marginBottom: 12 }}>
                    <label>Tên đăng nhập *</label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Mật khẩu *</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Họ tên *</label>
                    <input
                        name="hoTen"
                        value={form.hoTen}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Số điện thoại *</label>
                    <input
                        name="sdt"
                        value={form.sdt}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Tỉnh/Thành phố *</label>
                    <select
                        name="tinh"
                        value={form.tinh}
                        onChange={handleChange}
                        className="login-input"
                        style={{
                            width: "100%",
                            padding: 8,
                            marginTop: 4,
                        }}
                    >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((q) => (
                            <option key={q.code} value={q.code}>
                                {q.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Quận/Huyện *</label>
                    <select
                        name="quan"
                        value={form.quan}
                        onChange={handleChange}
                        disabled={!form.tinh}
                        className="login-input"
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
                <div style={{ marginBottom: 12 }}>
                    <label>Phường/Xã *</label>
                    <select
                        name="phuong"
                        value={form.phuong}
                        onChange={handleChange}
                        disabled={!form.quan}
                        className="login-input"
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
                <div style={{ marginBottom: 12 }}>
                    <label>Số nhà *</label>
                    <input
                        name="soNha"
                        value={form.soNha}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Vai trò *</label>
                    <select
                        name="viTri"
                        value={form.viTri}
                        onChange={handleChange}
                        required
                        className="login-input"
                    >
                        <option value="">Chọn vai trò</option>
                        {viTriList.map((vt) => (
                            <option key={vt} value={vt}>
                                {vt}
                            </option>
                        ))}
                    </select>
                </div>
                {error && (
                    <div style={{ color: "red", marginBottom: 12 }}>
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    className="login-btn"
                    style={{ width: "100%" }}
                >
                    Đăng ký
                </button>
            </form>
        </div>
    );
}

export default SignUpForm;
