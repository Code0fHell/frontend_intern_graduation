import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CarRegisterForm from "../components/CarRegisterForm";
import "../assets/css/CarRegisterPage.css";

function CarRegisterPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="register-root">
            <Header />
            <main className="register-main">
                <h1 className="register-title">Đăng ký xe</h1>
                {!showForm && (
                    <>
                        <img
                            src="/register-car.svg"
                            alt="Đăng ký xe"
                            className="register-img"
                        />
                        <button
                            className="register-btn"
                            onClick={() => setShowForm(true)}
                        >
                            Đăng ký cho thuê xe
                        </button>
                        <div className="register-steps">
                            <div className="register-steps-title">
                                Thủ tục đăng ký 4 bước đơn giản & nhanh chóng:
                            </div>
                            <ul className="register-steps-list">
                                <li>
                                    <span role="img" aria-label="car">
                                        🚗
                                    </span>{" "}
                                    Điền thông tin xe
                                </li>
                                <li>
                                    <span role="img" aria-label="upload">
                                        🖼️
                                    </span>{" "}
                                    Tải hình ảnh xe
                                </li>
                                <li>
                                    <span role="img" aria-label="consult">
                                        💬
                                    </span>{" "}
                                    ChevMaz tư vấn chủ xe &amp; phê duyệt
                                </li>
                                <li>
                                    <span role="img" aria-label="rent">
                                        🔑
                                    </span>{" "}
                                    Bắt đầu cho thuê
                                </li>
                            </ul>
                        </div>
                    </>
                )}
                {showForm && <CarRegisterForm />}
            </main>
            <Footer />
        </div>
    );
}

export default CarRegisterPage;
