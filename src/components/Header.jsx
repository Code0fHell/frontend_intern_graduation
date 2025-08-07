import "../assets/css/Header.css";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Header() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    localStorage.setItem("user", JSON.stringify(user));
    function handleLogout() {
        setUser(null);
        navigate("/login");
    }

    const isKH = user?.id?.includes("KH");
    const isDT = user?.id?.includes("DT");
    const isNV = user?.id?.includes("NV");
    const isQL = user?.id?.includes("QL");

    return (
        <header className="header">
            <div className="header-logo" onClick={() => navigate("/")}>
                <img
                    src="/logo.svg"
                    alt="ChevMaz Logo"
                    className="header-logo-img"
                />
                <span className="header-logo-text">ChevMaz</span>
            </div>
            <nav className="header-nav">
                {user ? (
                    <div className="header-user-info">
                        {isKH && (
                            <>
                                <button
                                    className="header-link"
                                    onClick={() => navigate("/cars")}
                                >
                                    Thuê xe tự lái
                                </button>
                                <button
                                    className="header-link"
                                    onClick={() => navigate("/contracts")}
                                >
                                    Danh sách hợp đồng
                                </button>
                            </>
                        )}
                        {isDT && (
                            <>
                                <button
                                    className="header-link"
                                    onClick={() => navigate("/partner_cars")}
                                >
                                    Danh sách xe
                                </button>
                                <button
                                    className="header-link"
                                    onClick={() => navigate("/register-car")}
                                >
                                    Đăng ký cho thuê
                                </button>
                                <button
                                    className="header-link"
                                    onClick={() =>
                                        navigate("/partner-contracts")
                                    }
                                >
                                    Danh sách hợp đồng
                                </button>
                            </>
                        )}
                        {isNV && (
                            <>
                                <button
                                    className="header-link"
                                    onClick={() => navigate("/employee-cars")}
                                >
                                    Danh sách xe
                                </button>
                                <button
                                    className="header-link"
                                    onClick={() => navigate("/contracts")}
                                >
                                    Danh sách hợp đồng
                                </button>
                            </>
                        )}
                        {isQL && (
                            <>
                                <button
                                    className="header-link"
                                    onClick={() => navigate("/admin/cars")}
                                >
                                    Danh sách xe
                                </button>
                                <button
                                    className="header-link"
                                    onClick={() => navigate("/admin/revenue")}
                                >
                                    Doanh thu
                                </button>
                            </>
                        )}
                        <span className="header-user-name">{user.hoTen}</span>
                        <button
                            className="header-link"
                            onClick={handleLogout}
                            style={{ marginLeft: 16 }}
                        >
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    <>
                        <a href="/login" className="header-link">
                            Đăng nhập
                        </a>
                        <a href="/register" className="header-link">
                            Đăng ký
                        </a>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Header;
