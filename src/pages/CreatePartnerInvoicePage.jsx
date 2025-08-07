import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CreateInvoicePage.css";

function CreatePartnerInvoicePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const contract = location.state?.contract;
    const [tongTien, setTongTien] = useState(contract?.giaThue || 0);
    const [ngayThanhToan, setNgayThanhToan] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [phuongThuc, setPhuongThuc] = useState("Tiền mặt");
    const [ghiChu, setGhiChu] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost:8080/hoa-don-doi-tac",
                {
                    hopDongThueId: contract.id,
                    nhanVienId: contract.nhanVien?.id,
                    tongTien,
                    ngayThanhToan,
                    phuongThucThanhToan: phuongThuc,
                    ghiChu,
                }
            );
            navigate("/partner-invoice-preview", {
                state: {
                    invoice: res.data,
                    contract,
                    tongTien,
                    ngayThanhToan,
                    phuongThuc,
                    ghiChu,
                },
            });
        } catch {
            alert("Tạo hóa đơn đối tác thất bại!");
        }
    };

    if (!contract) return <div>Không tìm thấy hợp đồng!</div>;

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <h2>Tạo hóa đơn thanh lý hợp đồng với đối tác</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <b>Đối tác:</b> {contract.oto?.doiTac?.hoTen}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Xe:</b> {contract.oto?.bienSo} -{" "}
                        {contract.oto?.mauXe?.ten}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Giá thuê:</b> {contract.giaThue?.toLocaleString()}{" "}
                        VNĐ
                    </div>
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
