import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const tinhList = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định",
    "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông",
    "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương",
    "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng",
    "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
    "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh",
    "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh",
    "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const viTriList = ["Khách hàng", "Đối tác",
                    // "Nhân viên", 
                    // "Quản lý"
                    ];

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

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setShowSuccess("true");
        try {
            await axios.post("http://localhost:8080/api/auth/register", form);
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
            });
            setTimeout(() => {
                setShowSuccess(false);
                navigate("/login");
            }, 1500);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Đăng ký thất bại"
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
                        transition: "all 0.3s"
                    }}
                >
                    Đăng ký thành công! Đang chuyển sang trang đăng nhập...
                </div>
            )}
            <form onSubmit={handleSubmit} style={{ width: 400, background: "#fff", padding: 32, borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
                <h2 style={{ textAlign: "center", marginBottom: 24 }}>Đăng ký tài khoản</h2>
                <div style={{ marginBottom: 12 }}>
                    <label>Tên đăng nhập *</label>
                    <input name="username" value={form.username} onChange={handleChange} required className="login-input" />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Mật khẩu *</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} required className="login-input" />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Họ tên *</label>
                    <input name="hoTen" value={form.hoTen} onChange={handleChange} required className="login-input" />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Số điện thoại *</label>
                    <input name="sdt" value={form.sdt} onChange={handleChange} required className="login-input" />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required className="login-input" />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Tỉnh/Thành phố *</label>
                    <select name="tinh" value={form.tinh} onChange={handleChange} required className="login-input">
                        <option value="">Chọn tỉnh/thành phố</option>
                        {tinhList.map(tinh => (
                            <option key={tinh} value={tinh}>{tinh}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Quận/Huyện *</label>
                    <input name="quan" value={form.quan} onChange={handleChange} required className="login-input" />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Phường/Xã *</label>
                    <input name="phuong" value={form.phuong} onChange={handleChange} required className="login-input" />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Số nhà *</label>
                    <input name="soNha" value={form.soNha} onChange={handleChange} required className="login-input" />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Vai trò *</label>
                    <select name="viTri" value={form.viTri} onChange={handleChange} required className="login-input">
                        <option value="">Chọn vai trò</option>
                        {viTriList.map(vt => (
                            <option key={vt} value={vt}>{vt}</option>
                        ))}
                    </select>
                </div>
                {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
                <button type="submit" className="login-btn" style={{ width: "100%" }}>Đăng ký</button>
            </form>
        </div>
    );
}

export default SignUpForm;