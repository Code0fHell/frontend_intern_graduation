import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CreatePartnerContractPage.css";

function CreatePartnerContractPage() {
    const { id } = useParams();
    console.log("car id: " + id);
    const location = useLocation();
    console.log("current location state: " + JSON.stringify(location.state));
    const { user } = useAuth();
    const carInfo = location.state?.carInfo || {};
    const [ngayBatDau, setNgayBatDau] = useState("");
    const [ngayKetThuc, setNgayKetThuc] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    
    // Thông tin bổ sung cho hợp đồng
    const [phanTramDoiTac, setPhanTramDoiTac] = useState("10");
    const [phiDichVu, setPhiDichVu] = useState("10");
    useEffect( () => {
        setPhiDichVu(100 - Number(phanTramDoiTac));

    }, [phanTramDoiTac]); 
    const navigate = useNavigate();
    
    // Giả sử carInfo có thông tin đối tác
    const partner = carInfo.partner || {};
    console.log("partner info: " + JSON.stringify(partner));
    const diaChiBenA = "Km10, Đường Nguyễn Trãi, Q. Hà Đông, Hà Nội"; // Địa chỉ công ty ChevMaz
    const handleCreate = async () => {
        try {
            await axios.post("http://localhost:8080/hop-dong-cho-thue", {
                otoId: id,
                quanLyId: user.id,
                ngayBatDau: new Date(ngayBatDau).getTime(),
                ngayKetThuc: new Date(ngayKetThuc).getTime(),
                ghiChu,
                phanTramCuaDoiTac: Number(phanTramDoiTac)
            });
            alert("Tạo hợp đồng thành công!");
            navigate("/admin/partner-contracts");
        } catch (e) {
            alert("Tạo hợp đồng thất bại!");
        }
    };

    return (
        <>
            <Header />
            <div className="create-contract-root">
                    <div className="create-contract-form">
                        <div className="contract-header">
                            <h3 className="contract-nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                            <p className="contract-motto">Độc lập - Tự do - Hạnh phúc</p>
                        </div>
                    
                    <h2 className="create-contract-title">
                        HỢP ĐỒNG HỢP TÁC MÔI GIỚI CHO THUÊ XE
                    </h2>
                    
                    <p className="contract-date">
                        Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}, chúng tôi gồm:
                    </p>
                    {/* Thông tin Bên A */}
                    <div className="contract-party">
                        <h4>BÊN A (CỬA HÀNG):</h4>
                        <div className="create-contract-row">
                            <span className="create-contract-label">Tên cửa hàng:</span>
                            <b className="create-contract-value">ChevMaz</b>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">Địa chỉ:</span>
                            <b className="create-contract-value">{diaChiBenA}</b>
                        </div>
                    </div>

                    {/* Thông tin Bên B */}
                    <div className="contract-party">
                        <h4>BÊN B (CHỦ XE):</h4>
                        <div className="create-contract-row">
                            <span className="create-contract-label">Họ tên:</span>
                            <b className="create-contract-value">
                                {partner.ten || "Tên đối tác"}
                            </b>
                        </div>
                        
                        <div className="create-contract-row">
                            <span className="create-contract-label">Địa chỉ:</span>
                            <b className="create-contract-value">
                                {partner.diaChi}
                            </b>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">SĐT:</span>
                            <b className="create-contract-value">
                                {partner.sdt || "Số điện thoại"}
                            </b>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">Email:</span>
                            <b className="create-contract-value">
                                {partner.email || "Email"}
                            </b>
                        </div>
                    </div>

                    {/* Thời gian hợp đồng */}
                    <div className="contract-section">
                        <h4>Thời gian hợp đồng:</h4>
                        <div className="create-contract-row">
                            <span className="create-contract-label">Ngày bắt đầu:</span>
                            <input
                                type="date"
                                className="create-contract-input"
                                value={ngayBatDau}
                                onChange={(e) => setNgayBatDau(e.target.value)}
                            />
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">Ngày kết thúc:</span>
                            <input
                                type="date"
                                className="create-contract-input"
                                value={ngayKetThuc}
                                onChange={(e) => setNgayKetThuc(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Điều khoản hợp đồng */}
                    <div className="create-contract-terms">
                        <h4>Điều 1: Nội dung hợp tác</h4>
                        <ul>
                            <li>Bên A đóng vai trò trung gian môi giới giữa Bên B và khách thuê xe.</li>
                            <li>Bên B cung cấp xe đạt tiêu chuẩn để cho thuê.</li>
                        </ul>

                        {/* Phí dịch vụ */}
                        <div className="contract-section">
                            <h4>Điều 2: Phí thuê xe 1 ngày và dịch vụ</h4>
                            <p className="contract-description">
                                Giá thuê xe 1 ngày đối với xe được đăng ký là : {carInfo.gia} VNĐ/ngày 
                            </p>
                            <p className="contract-description">
                                Bên A thu phí dịch vụ {phiDichVu}% giá trị hợp đồng thuê xe từ Bên B.
                            </p>
                            <div className="create-contract-row">
                                <span className="create-contract-label">Đối tác nhận:</span>
                                <input
                                    type="input"
                                    className="create-contract-input create-contract-input-percentage"
                                    value={phanTramDoiTac}
                                    onChange={(e) => setPhanTramDoiTac(e.target.value)}
                                />
                                <span>% tổng giá trị hợp đồng thuê xe</span>
                            </div>
                        </div>

                        <div className="create-contract-row">
                            <span className="create-contract-label">Ghi chú:</span>
                            <textarea
                                className="create-contract-textarea"
                                value={ghiChu}
                                onChange={(e) => setGhiChu(e.target.value)}
                                placeholder="Nhập ghi chú bổ sung (nếu có)"
                            />
                        </div>

                        <h4>Điều 3: Quyền và nghĩa vụ của các bên</h4>
                        <ul>
                            <li><strong>Bên A:</strong> Quảng bá, tìm khách, hỗ trợ ký hợp đồng.</li>
                            <li><strong>Bên B:</strong> Cung cấp xe đúng mô tả, tình trạng tốt.</li>
                            <li>Không sử dụng xe vào mục đích trái pháp luật.</li>
                            <li>Thanh toán đầy đủ và đúng hạn theo thỏa thuận.</li>
                            <li>Cả hai bên tuân thủ pháp luật Việt Nam.</li>
                        </ul>

                        <h4>Điều 4: Hiệu lực hợp đồng</h4>
                        <p>Hợp đồng có hiệu lực kể từ ngày ký. Chấm dứt khi một trong hai bên thông báo trước 7 ngày.</p>
                    </div>

                    <div className="contract-signatures">
                        <div className="signature-section">
                            <h4>ĐẠI DIỆN CÁC BÊN</h4>
                            <div className="signature-row">
                                <div className="signature-column">
                                    <p><strong>BÊN A</strong></p>
                                    <p>ChevMaz</p>
                                </div>
                                <div className="signature-column">
                                    <p><strong>BÊN B</strong></p>
                                    <p>{partner.ten || "________________"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        className="create-contract-btn"
                        onClick={handleCreate}
                    >
                        Xác nhận tạo hợp đồng
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CreatePartnerContractPage;