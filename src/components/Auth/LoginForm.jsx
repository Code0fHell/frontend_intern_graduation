import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/css/LoginForm.css";
import { useAuth } from "../../contexts/AuthContext";

function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setShowSuccess(false);

        try {
            const response = await axios.post(
                "http://localhost:8080/api/auth/login",
                { username, password }
            );
            setUser(response.data);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                navigate("/");
            }, 1500);
        } catch (err) {
            setError("Đăng nhập không thành công, hãy kiểm tra lại username và mật khẩu!");
        }
    }

    return (
        <div className="login-card" style={{ position: "relative" }}>
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
                    Đăng nhập thành công! Đang chuyển về trang chủ...
                </div>
            )}
            <h1 className="login-title">Welcome back!</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="" className="login-label">
                        Username
                        <span style={{ color: "#A259FF" }}>*</span>
                    </label>
                    <input
                        type="text"
                        className="login-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Username"
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="" className="login-label">
                        Password
                        <span style={{ color: "#A259FF" }}>*</span>
                    </label>
                    <input
                        type="password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="********"
                    />
                </div>
                <div className="login-row">
                    <label htmlFor="" className="login-checkbox-label">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            style={{ marginRight: 6 }}
                        />
                        Remember me
                    </label>
                    <a href="#" className="login-link">
                        Forgot password
                    </a>
                </div>
                {error && <div className="login-error">{error}</div>}
                <button type="submit" className="login-btn">
                    Login
                </button>
                <div className="login-footer">
                    Don&apos;t have an account?{" "}
                    <a href="/register" className="login-signup-link">
                        Sign up
                    </a>
                </div>
            </form>
        </div>
    );
}
    export default LoginForm;