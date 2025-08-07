import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CreateInvoicePage.css";

function CreateInvoicePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const contract = location.state?.contract;
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
            .get("http://localhost:8080/api/renting/phu-phi")
            .then((res) => setPhuPhiList(res.data))
            .catch(() => setPhuPhiList([]));
    }, []);

    useEffect(() => {
        // Tính tổng tiền: giá thuê + tổng phụ phí đã chọn (có thể có số lượng)
        let tongPhuPhi = 0;
        selectedPhuPhi.forEach((id) => {
            const phi = phuPhiList.find((p) => p.id === id);
            if (!phi) return;
            if (phi.ten?.toLowerCase().includes("giới hạn")) {
                tongPhuPhi += (phi.gia || 0) * vuotKm;
            } else if (phi.ten?.toLowerCase().includes("quá giờ")) {
                tongPhuPhi += (phi.gia || 0) * vuotGio;
            } else {
                tongPhuPhi += phi.gia || 0;
            }
        });
        setTongTien((contract?.gia || 0) + tongPhuPhi);
    }, [selectedPhuPhi, phuPhiList, contract, vuotGio, vuotKm]);

    const handlePhuPhiChange = (id) => {
        setSelectedPhuPhi((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gửi hóa đơn
            const res = await axios.post(
                "http://localhost:8080/api/renting/hoa-don",
                {
                    hopDongThueId: contract.id,
                    nhanVienId: contract.nhanVien?.id,
                    tongTien,
                    ngayThanhToan,
                    phuongThucThanhToan: phuongThuc,
                    ghiChu,
                }
            );
            // Gửi phụ phí được chọn
            let phuPhiDaChon = [];
            if (selectedPhuPhi.length > 0) {
                phuPhiDaChon = await axios.post(
                    "http://localhost:8080/api/renting/phu-phi-duoc-chon",
                    selectedPhuPhi.map((id) => {
                        const phi = phuPhiList.find((p) => p.id === id);
                        let soLuong = 1;
                        if (phi.ten?.toLowerCase().includes("giới hạn"))
                            soLuong = vuotKm;
                        if (phi.ten?.toLowerCase().includes("quá giờ"))
                            soLuong = vuotGio;
                        return {
                            phuPhi: { id },
                            hoaDon: { id: res.data.id },
                            soLuong,
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

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <h2>Tạo hóa đơn thanh lý hợp đồng</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <b>Khách hàng:</b> {contract.khachHang?.hoTen}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Xe:</b> {contract.oto?.bienSo} -{" "}
                        {contract.oto?.mauXe?.ten}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <b>Giá thuê:</b> {contract.gia?.toLocaleString()} VNĐ
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
                    <div style={{ marginBottom: 16 }}>
                        <b>Phụ phí có thể phát sinh</b>
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

export default CreateInvoicePage;
