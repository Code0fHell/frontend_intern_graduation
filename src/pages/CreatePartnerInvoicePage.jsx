import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CreateInvoicePage.css";
import { useAuth } from "../contexts/AuthContext";

function CreatePartnerInvoicePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const contract = location.state?.contract;
    // Thông tin hợp đồng cho thuê (HopDongChoThue)
    const hopDongChoThue = contract;
    console.log("contract: " + JSON.stringify(hopDongChoThue));
    // Tính ngày bắt đầu/kết thúc theo các hợp đồng thuê liên quan nếu cần
    const [ngayBatDau, setNgayBatDau] = useState(
        hopDongChoThue?.ngayBatDau
            ? new Date(hopDongChoThue.ngayBatDau).toISOString().slice(0, 10)
            : ""
    );
    const [ngayKetThuc, setNgayKetThuc] = useState(
        hopDongChoThue?.ngayKetThuc
            ? new Date(hopDongChoThue.ngayKetThuc).toISOString().slice(0, 10)
            : ""
    );
    const [ngayThanhToan, setNgayThanhToan] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [phuongThuc, setPhuongThuc] = useState("Tiền mặt");
    const [ghiChu, setGhiChu] = useState("");
    // Tổng doanh thu và phần trăm của đối tác
    const tongDoanhThu = hopDongChoThue?.giaThue || 0;
    const phanTramCuaDoiTac = hopDongChoThue?.phanTramCuaDoiTac || 0;

    // Tính tổng tiền thanh toán cho đối tác
    const tongTienThanhToan = Math.round(
        (tongDoanhThu * phanTramCuaDoiTac) / 100
    );

    // Hiển thị tổng tiền và gửi đúng khi tạo hóa đơn
    const [tongTien, setTongTien] = useState(tongTienThanhToan);

    useEffect(() => {
        setTongTien(Math.round((tongDoanhThu * phanTramCuaDoiTac) / 100));
    }, [tongDoanhThu, phanTramCuaDoiTac]);

    // Lấy tổng tiền từ API khi có đủ thông tin
    useEffect(() => {
        if (hopDongChoThue?.id && ngayBatDau && ngayKetThuc) {
            axios
                .get("http://localhost:8080/api/hoa-don/tong-tien", {
                    params: {
                        hopDongChoThueId: hopDongChoThue.id,
                        ngayBatDau: new Date(ngayBatDau)
                            .toISOString()
                            .replace("T", " ")
                            .slice(0, 19),
                        ngayKetThuc: new Date(ngayKetThuc)
                            .toISOString()
                            .replace("T", " ")
                            .slice(0, 19),
                    },
                })
                .then((res) => {
                    if (!isNaN(Number(res.data))) {
                        setTongTien(Number(res.data));
                    }
                })
                .catch(() => {});
        }
    }, [hopDongChoThue?.id, ngayBatDau, ngayKetThuc]);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi API tạo hóa đơn đối tác
            const res = await axios.post(
                "http://localhost:8080/hoa-don-doi-tac",
                {
                    hopDongChoThueId: hopDongChoThue.id,
                    nhanVienId: user?.id,
                    tongTien,
                    ngayThanhToan: new Date(ngayThanhToan).toISOString().replace("T", " ").slice(0, 19),
                    ngayBatDau: new Date(ngayBatDau).toISOString().replace("T", " ").slice(0, 19),
                    ngayKetThuc: new Date(ngayKetThuc).toISOString().replace("T", " ").slice(0, 19),
                    phuongThucThanhToan: phuongThuc,
                    ghiChu,
                }
            );
            navigate("/partner-invoice-preview", {
                state: {
                    invoice: res.data,
                    contract: hopDongChoThue,
                    tongTien,
                    ngayThanhToan,
                    ngayBatDau,
                    ngayKetThuc,
                    phuongThuc,
                    ghiChu,
                },
            });
        } catch (err) {
            alert(
                "Tạo hóa đơn đối tác thất bại! " + (err?.response?.data || "")
            );
        }
        setLoading(false);
    };

    if (!hopDongChoThue) return <div>Không tìm thấy hợp đồng!</div>;

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <h2>Tạo hóa đơn thanh lý hợp đồng với đối tác</h2>
                <form onSubmit={handleSubmit}>
                    <h3>I. Thông tin đối tác</h3>
                    <div style={{ marginBottom: 16 }}>
                        <b>Họ tên:</b> {hopDongChoThue.oto?.doiTac?.hoTen}
                        <br />
                        <b>Địa chỉ:</b>{" "}
                        {hopDongChoThue.oto?.doiTac?.diaChi?.soNha},{" "}
                        {hopDongChoThue.oto?.doiTac?.diaChi?.phuong},{" "}
                        {hopDongChoThue.oto?.doiTac?.diaChi?.quan},{" "}
                        {hopDongChoThue.oto?.doiTac?.diaChi?.tinh}
                        <br />
                        <b>SĐT:</b> {hopDongChoThue.oto?.doiTac?.sdt}
                        <br />
                        <b>Email:</b> {hopDongChoThue.oto?.doiTac?.email}
                    </div>
                    <h3>II. Thông tin xe</h3>
                    <div style={{ marginBottom: 16 }}>
                        <b>Biển số:</b> {hopDongChoThue.oto?.bienSo}
                        <br />
                        <b>Hãng xe:</b> {hopDongChoThue.oto?.mauXe?.hangXe?.ten}
                        <br />
                        <b>Mẫu xe:</b> {hopDongChoThue.oto?.mauXe?.ten}
                        <br />
                        <b>Số ghế:</b> {hopDongChoThue.oto?.mauXe?.soGhe}
                    </div>
                    <h3>III. Thông tin hợp đồng cho thuê</h3>
                    <div style={{ marginBottom: 16 }}>
                        <b>Ngày bắt đầu:</b>
                        <input
                            type="date"
                            value={ngayBatDau}
                            onChange={(e) => setNgayBatDau(e.target.value)}
                            style={{ marginLeft: 8 }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Ngày kết thúc:</b>
                        <input
                            type="date"
                            value={ngayKetThuc}
                            onChange={(e) => setNgayKetThuc(e.target.value)}
                            style={{ marginLeft: 8 }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Tổng doanh thu:</b> {tongDoanhThu.toLocaleString()}{" "}
                        VNĐ
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Phần trăm của đối tác:</b> {phanTramCuaDoiTac}%
                    </div>
                    <h3>IV. Thanh toán</h3>
                    <div style={{ marginBottom: 16 }}>
                        <b>Ngày thanh toán:</b>
                        <input
                            type="date"
                            value={ngayThanhToan}
                            onChange={(e) => setNgayThanhToan(e.target.value)}
                            style={{ marginLeft: 8 }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Phương thức thanh toán:</b>
                        <select
                            value={phuongThuc}
                            onChange={(e) => setPhuongThuc(e.target.value)}
                            style={{ marginLeft: 8 }}
                        >
                            <option value="Tiền mặt">Tiền mặt</option>
                            <option value="Chuyển khoản">Chuyển khoản</option>
                            <option value="Thẻ">Thẻ</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Ghi chú:</b>
                        <input
                            type="text"
                            value={ghiChu}
                            onChange={(e) => setGhiChu(e.target.value)}
                            style={{
                                marginLeft: 8,
                                width: 300,
                                padding: 4,
                            }}
                            placeholder="Nhập ghi chú cho hóa đơn (nếu có)"
                        />
                    </div>
                    <div style={{ marginBottom: 24, fontSize: 20 }}>
                        <b>Tổng tiền:</b> {tongTien.toLocaleString()} VNĐ
                    </div>
                    <button
                        className="contract-btn contract-btn-approve"
                        type="submit"
                        disabled={loading}
                    >
                        Tạo hóa đơn
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default CreatePartnerInvoicePage;
