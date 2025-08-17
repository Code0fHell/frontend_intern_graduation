import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CreatePartnerContractPage.css";
import { useAuth } from "../contexts/AuthContext"; 

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "OK", label: "Còn hiệu lực" },
    { value: "HUY", label: "Đã hủy" },
    { value: "HET_HAN_HOP_DONG", label: "Hết hạn hợp đồng" },
];

function ContractPartnerDetailPage() {
    const { id } = useParams();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth(); // Lấy user từ context hoặc localStorage

    useEffect(() => {
        axios
            .get(`http://localhost:8080/hop-dong-cho-thue/${id}`)
            .then((res) => {
                setContract(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleCancel = async () => {
        if (!window.confirm("Bạn chắc chắn muốn hủy hợp đồng này?")) return;
        try {
            await axios.put(
                `http://localhost:8080/hop-dong-cho-thue/huy/${id}`
            );
            alert("Hợp đồng đã được hủy!");
            navigate("/partner-contracts");
        } catch {
            alert("Hủy hợp đồng thất bại!");
        }
    };

    const handleFinish = async () => {
        if (!window.confirm("Bạn chắc chắn muốn thanh lý hợp đồng này?"))
            return;
        try {
            await axios.put(
                `http://localhost:8080/hop-dong-cho-thue/thanh-ly/${id}`
            );
            alert("Hợp đồng đã được thanh lý!");
            navigate("/admin/partner-contracts");
        } catch {
            alert("Thanh lý hợp đồng thất bại!");
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (!contract) return <div>Không tìm thấy hợp đồng.</div>;

    const partner = contract.oto?.doiTac || {};
    const carInfo = contract.oto || {};
    const diaChiBenA = "Km10, Đường Nguyễn Trãi, Q. Hà Đông, Hà Nội";
    const isDT = user?.id?.includes("DT");
    const isQL = user?.id?.includes("QL");
    const isDisabled =
        contract.trangThai === "HUY" ||
        contract.trangThai === "HET_HAN_HOP_DONG";

    return (
        <>
            <Header />
            <div className="create-contract-root">
                <div className="create-contract-form">
                    <div className="contract-header">
                        <h3 className="contract-nation">
                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </h3>
                        <p className="contract-motto">
                            Độc lập - Tự do - Hạnh phúc
                        </p>
                    </div>
                    <h2 className="create-contract-title">
                        HỢP ĐỒNG HỢP TÁC MÔI GIỚI CHO THUÊ XE
                    </h2>
                    <p className="contract-date">
                        Hôm nay, ngày {new Date(contract.ngayBatDau).getDate()}{" "}
                        tháng {new Date(contract.ngayBatDau).getMonth() + 1} năm{" "}
                        {new Date(contract.ngayBatDau).getFullYear()}, chúng tôi
                        gồm:
                    </p>
                    {/* Thông tin Bên A */}
                    <div className="contract-party">
                        <h4>BÊN A (CỬA HÀNG):</h4>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Tên cửa hàng:
                            </span>
                            <b className="create-contract-value">ChevMaz</b>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Địa chỉ:
                            </span>
                            <b className="create-contract-value">
                                {diaChiBenA}
                            </b>
                        </div>
                    </div>
                    {/* Thông tin Bên B */}
                    <div className="contract-party">
                        <h4>BÊN B (CHỦ XE):</h4>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Họ tên:
                            </span>
                            <b className="create-contract-value">
                                {partner.hoTen || "Tên đối tác"}
                            </b>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Địa chỉ:
                            </span>
                            <b className="create-contract-value">
                                {partner.diaChi.tinh}, {partner.diaChi.quan},{" "}
                                {partner.diaChi.phuong}, {partner.diaChi.soNha}
                            </b>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">SĐT:</span>
                            <b className="create-contract-value">
                                {partner.sdt || "Số điện thoại"}
                            </b>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Email:
                            </span>
                            <b className="create-contract-value">
                                {partner.email || "Email"}
                            </b>
                        </div>
                    </div>
                    {/* Thời gian hợp đồng */}
                    <div className="contract-section">
                        <h4>Thời gian hợp đồng:</h4>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Ngày bắt đầu:
                            </span>
                            <span className="create-contract-value">
                                {contract.ngayBatDau
                                    ? new Date(
                                          contract.ngayBatDau
                                      ).toLocaleDateString()
                                    : ""}
                            </span>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Ngày kết thúc:
                            </span>
                            <span className="create-contract-value">
                                {contract.ngayKetThuc
                                    ? new Date(
                                          contract.ngayKetThuc
                                      ).toLocaleDateString()
                                    : ""}
                            </span>
                        </div>
                    </div>
                    <div className="contract-section">
                        <h4>Trạng thái hợp đồng:</h4>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Trạng thái hiện tại:
                            </span>
                            <span className="create-contract-value">
                                {contract.trangThai
                                    ? STATUS_OPTIONS.find(
                                          (s) => s.value === contract.trangThai
                                      )?.label || contract.trangThai
                                    : ""}
                            </span>
                        </div>
                    </div>
                    {/* Điều khoản hợp đồng */}
                    <div className="create-contract-terms">
                        <h4>Điều 1: Nội dung hợp tác</h4>
                        <ul>
                            <li>
                                Bên A đóng vai trò trung gian môi giới giữa Bên
                                B và khách thuê xe.
                            </li>
                            <li>
                                Bên B cung cấp xe đạt tiêu chuẩn để cho thuê.
                            </li>
                        </ul>
                        {/* Phí dịch vụ */}
                        <div className="contract-section">
                            <h4>Điều 2: Phí thuê xe 1 ngày và dịch vụ</h4>
                            <p className="contract-description">
                                Giá thuê xe 1 ngày đối với xe được đăng ký là :{" "}
                                {carInfo.gia} VNĐ/ngày
                            </p>
                            <p className="contract-description">
                                Bên A thu phí dịch vụ{" "}
                                {contract.phanTramCuaDoiTac
                                    ? 100 - contract.phanTramCuaDoiTac
                                    : 10}
                                % giá trị hợp đồng thuê xe từ Bên B.
                            </p>
                            <div className="create-contract-row">
                                <span className="create-contract-label">
                                    Đối tác nhận:
                                </span>
                                <span className="create-contract-value">
                                    {contract.phanTramCuaDoiTac || 10}
                                </span>
                                <span>% tổng giá trị hợp đồng thuê xe</span>
                            </div>
                        </div>
                        <div className="create-contract-row">
                            <span className="create-contract-label">
                                Ghi chú:
                            </span>
                            <span className="create-contract-value">
                                {contract.ghiChu || ""}
                            </span>
                        </div>
                        <h4>Điều 3: Quyền và nghĩa vụ của các bên</h4>
                        <ul>
                            <li>
                                <strong>Bên A:</strong> Quảng bá, tìm khách, hỗ
                                trợ ký hợp đồng.
                            </li>
                            <li>
                                <strong>Bên B:</strong> Cung cấp xe đúng mô tả,
                                tình trạng tốt.
                            </li>
                            <li>
                                Không sử dụng xe vào mục đích trái pháp luật.
                            </li>
                            <li>
                                Thanh toán đầy đủ và đúng hạn theo thỏa thuận.
                            </li>
                            <li>Cả hai bên tuân thủ pháp luật Việt Nam.</li>
                        </ul>
                        <h4>Điều 4: Hiệu lực hợp đồng</h4>
                        <p>
                            Hợp đồng có hiệu lực kể từ ngày ký. Chấm dứt khi một
                            trong hai bên thông báo trước 7 ngày.
                        </p>
                    </div>
                    <div className="contract-signatures">
                        <div className="signature-section">
                            <h4>ĐẠI DIỆN CÁC BÊN</h4>
                            <div className="signature-row">
                                <div className="signature-column">
                                    <p>
                                        <strong>BÊN A</strong>
                                    </p>
                                    <p>ChevMaz</p>
                                </div>
                                <div className="signature-column">
                                    <p>
                                        <strong>BÊN B</strong>
                                    </p>
                                    <p>{partner.hoTen || "________________"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Nút hành động */}
                    {isDT && !isDisabled && (
                        <button
                            className="create-contract-btn"
                            style={{ background: "#ef4444" }}
                            onClick={handleCancel}
                        >
                            Hủy hợp đồng
                        </button>
                    )}
                    {isQL && !isDisabled && (
                        <button
                            className="create-contract-btn"
                            style={{ background: "#0ea5e9" }}
                            onClick={handleFinish}
                        >
                            Thanh lý
                        </button>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ContractPartnerDetailPage;
