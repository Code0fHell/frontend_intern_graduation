import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CreateInvoicePage.css";
import { useAuth } from "../contexts/AuthContext";

function CreateInvoicePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuth().user;
    const contract = location.state?.contract;
    console.log("contract: " + JSON.stringify(contract));
    const [phuPhiList, setPhuPhiList] = useState([]);
    const [selectedPhuPhi, setSelectedPhuPhi] = useState([]);
    const [vuotGio, setVuotGio] = useState(0);
    const [vuotKm, setVuotKm] = useState(0);
    const [tongTien, setTongTien] = useState(contract?.gia || 0);
    const [ngayThanhToan, setNgayThanhToan] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [phuongThuc, setPhuongThuc] = useState("Tiền mặt");
    const [ghiChu, setGhiChu] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/phu-phi")
            .then((res) => setPhuPhiList(res.data))
            .catch(() => setPhuPhiList([]));
    }, []);

    useEffect(() => {
        let tongPhuPhi = 0;
        selectedPhuPhi.forEach((id) => {
            const phi = phuPhiList.find((p) => p.id === id);
            if (!phi) return;
            if (phi.ten?.toLowerCase().includes("giới hạn")) {
                tongPhuPhi += (phi.gia || 0) * vuotKm;
            } else if (phi.ten?.toLowerCase().includes("quá giờ")) {
                // Nếu quá 6 giờ thì tính phụ phí bằng 1 ngày thuê
                if (vuotGio > 6) {
                    tongPhuPhi += contract?.gia || 0;
                } else {
                    tongPhuPhi += (phi.gia || 0) * vuotGio;
                }
            } else {
                tongPhuPhi += phi.gia || 0;
            }
        });
        setTongTien(tongTienChuaPhuPhi + tongPhuPhi);
        // eslint-disable-next-line
    }, [selectedPhuPhi, phuPhiList, contract, vuotGio, vuotKm]);

    const handlePhuPhiChange = (id) => {
        setSelectedPhuPhi((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    console.log(
        "res: " +
            JSON.stringify({
                hopDongThueId: contract.id,
                nhanVienId: user.id,
                tongTien,
                ngayThanhToan: new Date(ngayThanhToan)
                    .toISOString()
                    .replace("T", " ")
                    .slice(0, 19),
                phuongThucThanhToan: phuongThuc,
                ghiChu,
                ngayBatDau: contract.checkin,
                ngayKetThuc: contract.checkout,
            })
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gửi hóa đơn
            const res = await axios.post("http://localhost:8080/api/hoa-don", {
                hopDongThueId: contract.id,
                nhanVienId: user.id,
                tongTien,
                ngayThanhToan: new Date(ngayThanhToan)
                    .toISOString()
                    .replace("T", " ")
                    .slice(0, 19),
                phuongThucThanhToan: phuongThuc,
                ghiChu,
                ngayBatDau: contract.checkin,
                ngayKetThuc: contract.checkout,
            });

            if (selectedPhuPhi.length > 0) {
                await axios.post(
                    "http://localhost:8080/api/phu-phi/phu-phi-duoc-chon",
                    selectedPhuPhi.map((id) => {
                        const phi = phuPhiList.find((p) => p.id === id);
                        let soLuong = 1;
                        let soGioValue = 0;
                        if (phi.ten?.toLowerCase().includes("giới hạn")) {
                            soLuong = vuotKm;
                        }
                        if (phi.ten?.toLowerCase().includes("quá giờ")) {
                            soLuong = vuotGio > 5 ? 1 : vuotGio;
                            soGioValue = vuotGio;
                        }
                        return {
                            phuPhiId: id,
                            hoaDonId: res.data.id,
                            soLuong,
                            soGio: soGioValue,
                        };
                    })
                );
            }
            // Chuyển sang trang preview hóa đơn
            navigate("/invoice-preview", {
                state: {
                    invoice: res.data,
                    contract,
                    phuPhiList: phuPhiList.filter((p) =>
                        selectedPhuPhi.includes(p.id)
                    ),
                    vuotKm,
                    vuotGio,
                    ghiChu,
                    selectedPhuPhi,
                },
            });
        } catch {
            alert("Tạo hóa đơn thất bại!");
        }
    };

    if (!contract) return <div>Không tìm thấy hợp đồng!</div>;

    // Helper để lấy mô tả phụ phí
    const getMoTa = (phi) => {
        if (phi.ten?.toLowerCase().includes("giới hạn"))
            return "Phụ phí phát sinh nếu lộ trình di chuyển vượt quá 350km khi thuê xe 1 ngày";
        if (phi.ten?.toLowerCase().includes("quá giờ"))
            return "Phụ phí phát sinh nếu hoàn trả xe trễ giờ. Trường hợp trễ quá 5 giờ, phụ phí tính thêm 1 ngày thuê";
        if (phi.ten?.toLowerCase().includes("vệ sinh"))
            return "Phụ phí phát sinh khi xe hoàn trả không đảm bảo vệ sinh (nhiều vết bẩn, bùn cát, sinh lầy...)";
        if (phi.ten?.toLowerCase().includes("khử mùi"))
            return "Phụ phí phát sinh khi xe hoàn trả bị ám mùi khó chịu (mùi thuốc lá, thực phẩm nặng mùi...)";
        return phi.moTa || "";
    };

    // Tính số ngày thuê (làm tròn lên, tối thiểu 1)
    let tongTienChuaPhuPhi = 0;
    if (contract?.checkin && contract?.checkout && contract?.gia) {
        const nhan = new Date(contract.checkin);
        const tra = new Date(contract.checkout);
        let soNgay = Math.ceil((tra - nhan) / (1000 * 60 * 60 * 24));
        if (soNgay < 1) soNgay = 1;
        tongTienChuaPhuPhi = soNgay * contract.gia;
    } else {
        tongTienChuaPhuPhi = contract?.gia || 0;
    }

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <h2>Tạo hóa đơn thanh lý hợp đồng</h2>
                <form onSubmit={handleSubmit}>
                    {/* Thông tin khách hàng */}
                    <h3 style={{ marginTop: 0 }}>I. Thông tin khách hàng</h3>
                    <div style={{ marginBottom: 16 }}>
                        <b>Họ tên:</b> {contract.khachHang?.hoTen} <br />
                        <b>Địa chỉ:</b> {contract.khachHang?.diaChi.soNha},{" "}
                        {contract.khachHang?.diaChi.phuong},{" "}
                        {contract.khachHang?.diaChi.quan},{" "}
                        {contract.khachHang?.diaChi.tinh} <br />
                        <b>SĐT:</b>{" "}
                        {contract.khachHang?.sdt ||
                            contract.khachHang?.soDienThoai}{" "}
                        <br />
                        <b>Email:</b> {contract.khachHang?.email}
                    </div>
                    {/* Thông tin đối tác */}
                    <h3>II. Thông tin đối tác (Chủ xe)</h3>
                    <div style={{ marginBottom: 16 }}>
                        <b>Họ tên:</b> {contract.oto?.doiTac?.hoTen} <br />
                        <b>Địa chỉ:</b> {contract.oto?.doiTac?.diaChi?.soNha},{" "}
                        {contract.oto?.doiTac?.diaChi?.phuong},{" "}
                        {contract.oto?.doiTac?.diaChi?.quan},{" "}
                        {contract.oto?.doiTac?.diaChi?.tinh} <br />
                        <b>SĐT:</b> {contract.oto?.doiTac?.sdt} <br />
                        <b>Email:</b> {contract.oto?.doiTac?.email}
                    </div>
                    {/* Thông tin xe */}
                    <h3>III. Thông tin xe</h3>
                    <div style={{ marginBottom: 16 }}>
                        <b>Biển số:</b> {contract.oto?.bienSo} <br />
                        <b>Hãng xe:</b> {contract.oto?.mauXe?.hangXe?.ten}{" "}
                        <br />
                        <b>Mẫu xe:</b> {contract.oto?.mauXe?.ten}
                        <br />
                        <b>Số ghế:</b> {contract.oto?.mauXe?.soGhe}
                    </div>
                    {/* Thông tin hợp đồng */}
                    <h3>IV. Thông tin hợp đồng</h3>
                    <div style={{ marginBottom: 16 }}>
                        <b>Giá thuê:</b> {contract.gia?.toLocaleString()} VNĐ
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Ngày bắt đầu:</b>{" "}
                        {contract.checkin?.toLocaleString()}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Ngày kết thúc:</b>{" "}
                        {contract.checkout?.toLocaleString()}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Ngày thanh toán:</b> {ngayThanhToan}
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
                    {/* Phụ phí */}
                    <h3>V. Phụ phí có thể phát sinh</h3>
                    <div style={{ marginBottom: 16 }}>
                        <div className="phuphi-box">
                            {phuPhiList.map((phi) => {
                                const isGioiHan = phi.ten
                                    ?.toLowerCase()
                                    .includes("giới hạn");
                                const isQuaGio = phi.ten
                                    ?.toLowerCase()
                                    .includes("quá giờ");
                                return (
                                    <div className="phuphi-item" key={phi.id}>
                                        <div className="phuphi-header">
                                            <input
                                                type="checkbox"
                                                checked={selectedPhuPhi.includes(
                                                    phi.id
                                                )}
                                                onChange={() =>
                                                    handlePhuPhiChange(phi.id)
                                                }
                                            />
                                            <span className="phuphi-title">
                                                {phi.ten}
                                            </span>
                                            <span className="phuphi-price">
                                                {phi.gia?.toLocaleString()}{" "}
                                                {isGioiHan
                                                    ? "/km"
                                                    : isQuaGio
                                                    ? "/giờ"
                                                    : "VNĐ"}
                                            </span>
                                        </div>
                                        <div className="phuphi-desc">
                                            {getMoTa(phi)}
                                        </div>
                                        {selectedPhuPhi.includes(phi.id) &&
                                            (isGioiHan || isQuaGio) && (
                                                <div className="phuphi-input">
                                                    <label>
                                                        Số{" "}
                                                        {isGioiHan
                                                            ? "km vượt"
                                                            : "giờ vượt"}
                                                        :&nbsp;
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={
                                                                isGioiHan
                                                                    ? vuotKm
                                                                    : vuotGio
                                                            }
                                                            onChange={(e) =>
                                                                isGioiHan
                                                                    ? setVuotKm(
                                                                          Number(
                                                                              e
                                                                                  .target
                                                                                  .value
                                                                          )
                                                                      )
                                                                    : setVuotGio(
                                                                          Number(
                                                                              e
                                                                                  .target
                                                                                  .value
                                                                          )
                                                                      )
                                                            }
                                                            style={{
                                                                width: 80,
                                                            }}
                                                            required
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Tổng tiền chưa tính phụ phí:</b>{" "}
                        {tongTienChuaPhuPhi.toLocaleString()} VNĐ
                    </div>
                    <div style={{ marginBottom: 24, fontSize: 20 }}>
                        <b>Thành tiền:</b> {tongTien.toLocaleString()} VNĐ
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

export default CreateInvoicePage;
