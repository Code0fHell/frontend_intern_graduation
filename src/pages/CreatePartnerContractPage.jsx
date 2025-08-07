import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CreatePartnerContractPage.css";

function CreatePartnerContractPage() {
    const { id } = useParams();
    const location = useLocation();
    console.log("current location state: " + JSON.stringify(location.state));
    const { user } = useAuth();
    const carInfo = location.state?.carInfo || {};
    const [ngayBatDau, setNgayBatDau] = useState("");
    const [ngayKetThuc, setNgayKetThuc] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    const navigate = useNavigate();
    // console.log("car info " + JSON.stringify(carInfo));
    // Giả sử carInfo có thông tin đối tác
    const partner = carInfo.partner || {};
    console.log("partner info: " + JSON.stringify(partner));
    const diaChiBenA = "Km10, Đường Nguyễn Trãi, Q. Hà Đông, Hà Nội" ; // Địa chỉ công ty ChevMaz

    const handleCreate = async () => {
        try {
            await axios.post("http://localhost:8080/hop-dong-cho-thue", {
                otoId: id,
                nhanVienId: user.id,
                ngayBatDau,
                ngayKetThuc,
                ghiChu,
                gia: carInfo.gia,
            });
            alert("Tạo hợp đồng thành công!");
            navigate("/contracts");
        } catch (e) {
            alert("Tạo hợp đồng thất bại!");
        }
    };

    return (
        <>
            <Header />
            <div className="create-contract-root">
                <h2 className="create-contract-title">
                    Tạo hợp đồng với đối tác
                </h2>
                <div className="create-contract-form">
                    <div className="create-contract-row">
                        <span className="create-contract-label">Bên A:</span>
                        <b className="create-contract-value">ChevMaz</b>
                    </div>
                    <div className="create-contract-row">
                        <span className="create-contract-label">
                            Địa chỉ Bên A:
                        </span>
                        <b className="create-contract-value">{diaChiBenA}</b>
                    </div>
                    <div className="create-contract-row">
                        <span className="create-contract-label">Bên B:</span>
                        <b className="create-contract-value">
                            {partner.ten || "Tên đối tác"}
                        </b>
                    </div>
                    <div className="create-contract-row">
                        <span className="create-contract-label">
                            Địa chỉ Bên B:
                        </span>
                        <b className="create-contract-value">
                            {partner.diaChi.soNha}, {partner.diaChi.phuong}, {partner.diaChi.quan}, {partner.diaChi.tinh}
                        </b>
                    </div>
                    <div className="create-contract-row">
                        <span className="create-contract-label">
                            SĐT Bên B:
                        </span>
                        <b className="create-contract-value">
                            {partner.sdt || "Số điện thoại"}
                        </b>
                    </div>
                    <div className="create-contract-row">
                        <span className="create-contract-label">
                            Nhân viên:
                        </span>
                        <b className="create-contract-value">{user.hoTen}</b>
                    </div>
                    <div className="create-contract-row">
                        <span className="create-contract-label">
                            Ngày bắt đầu:
                        </span>
                        <input
                            type="date"
                            className="create-contract-input"
                            value={ngayBatDau}
                            onChange={(e) => setNgayBatDau(e.target.value)}
                        />
                    </div>
                    <div className="create-contract-row">
                        <span className="create-contract-label">
                            Ngày kết thúc:
                        </span>
                        <input
                            type="date"
                            className="create-contract-input"
                            value={ngayKetThuc}
                            onChange={(e) => setNgayKetThuc(e.target.value)}
                        />
                    </div>
                    <div className="create-contract-row">
                        <span className="create-contract-label">Ghi chú:</span>
                        <textarea
                            className="create-contract-textarea"
                            value={ghiChu}
                            onChange={(e) => setGhiChu(e.target.value)}
                        />
                    </div>
                    <div className="create-contract-terms">
                        <h4>Điều khoản hợp đồng</h4>
                        <ul>
                            <li>
                                Bên A chịu trách nhiệm bảo quản xe trong thời
                                gian thuê.
                            </li>
                            <li>
                                Không sử dụng xe vào mục đích trái pháp luật.
                            </li>
                            <li>
                                Thanh toán đầy đủ và đúng hạn theo thỏa thuận.
                            </li>
                            <li>
                                Các điều khoản khác theo quy định của ChevMaz.
                            </li>
                        </ul>
                    </div>
                    <button
                        className="create-contract-btn"
                        onClick={handleCreate}
                    >
                        Xác nhận tạo
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CreatePartnerContractPage;
