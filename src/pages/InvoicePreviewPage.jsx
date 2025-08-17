import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../assets/css/CreateInvoicePage.css";

function InvoicePreviewPage() {
    const location = useLocation();
    const {
        invoice,
        contract,
        phuPhiList,
        vuotKm,
        vuotGio,
        ghiChu,
        selectedPhuPhi,
    } = location.state || {};

    if (!invoice || !contract) return <div>Không tìm thấy hóa đơn!</div>;

    const getPhuPhiRows = () => {
        return phuPhiList.map((phi, idx) => {
            let soLuong = 1;
            let donVi = "";
            if (phi.ten?.toLowerCase().includes("giới hạn")) {
                soLuong = vuotKm;
                donVi = "km";
            }
            if (phi.ten?.toLowerCase().includes("quá giờ")) {
                soLuong = vuotGio;
                donVi = "giờ";
            }
            return [
                idx + 1,
                phi.ten,
                soLuong,
                donVi,
                phi.gia?.toLocaleString(),
                ((phi.gia || 0) * soLuong).toLocaleString(),
            ];
        });
    };

    const handlePrint = () => {
        const doc = new jsPDF();

        doc.setFont("be vietnam", "normal");
        doc.setFontSize(18);
        doc.text("HÓA ĐƠN THANH LÝ HỢP ĐỒNG", 70, 18);
        doc.setFontSize(12);

        // Thông tin khách hàng
        doc.text(`Khách hàng: ${contract.khachHang?.hoTen || ""}`, 14, 30);
        doc.text(
            `Địa chỉ: ${contract.khachHang?.diaChi?.soNha || ""}, ${
                contract.khachHang?.diaChi?.phuong || ""
            }, ${contract.khachHang?.diaChi?.quan || ""}, ${
                contract.khachHang?.diaChi?.tinh || ""
            }`,
            14,
            36
        );
        doc.text(
            `SĐT: ${
                contract.khachHang?.sdt || contract.khachHang?.soDienThoai || ""
            }`,
            14,
            42
        );
        doc.text(`Email: ${contract.khachHang?.email || ""}`, 14, 48);

        // Thông tin đối tác
        doc.text(`Đối tác: ${contract.oto?.doiTac?.hoTen || ""}`, 14, 56);
        doc.text(
            `Địa chỉ: ${contract.oto?.doiTac?.diaChi?.soNha || ""}, ${
                contract.oto?.doiTac?.diaChi?.phuong || ""
            }, ${contract.oto?.doiTac?.diaChi?.quan || ""}, ${
                contract.oto?.doiTac?.diaChi?.tinh || ""
            }`,
            14,
            62
        );
        doc.text(`SĐT: ${contract.oto?.doiTac?.sdt || ""}`, 14, 68);
        doc.text(`Email: ${contract.oto?.doiTac?.email || ""}`, 14, 74);

        // Thông tin xe
        doc.text(
            `Xe: ${contract.oto?.bienSo || ""} - ${
                contract.oto?.mauXe?.hangXe?.ten || ""
            } ${contract.oto?.mauXe?.ten || ""}`,
            14,
            82
        );
        doc.text(`Số ghế: ${contract.oto?.mauXe?.soGhe || ""}`, 14, 88);

        // Thông tin hợp đồng
        doc.text(
            `Giá thuê: ${contract.gia?.toLocaleString() || ""} VNĐ`,
            14,
            96
        );
        doc.text(
            `Ngày bắt đầu: ${
                contract.checkin
                    ? new Date(contract.checkin).toLocaleString()
                    : ""
            }`,
            14,
            102
        );
        doc.text(
            `Ngày kết thúc: ${
                contract.checkout
                    ? new Date(contract.checkout).toLocaleString()
                    : ""
            }`,
            14,
            108
        );
        doc.text(
            `Ngày thanh toán: ${new Date(invoice.ngayThanhToan)
                .toISOString()
                .slice(0, 10)}`,
            14,
            114
        );
        doc.text(
            `Phương thức thanh toán: ${invoice.phuongThucThanhToan || ""}`,
            14,
            120
        );
        doc.text(`Ghi chú: ${invoice.ghiChu || ""}`, 14, 126);

        autoTable(doc, {
            startY: 132,
            head: [
                [
                    "STT",
                    "Tên phụ phí",
                    "Số lượng",
                    "Đơn vị",
                    "Đơn giá",
                    "Thành tiền",
                ],
            ],
            body: getPhuPhiRows(),
            styles: { font: "be vietnam" },
        });

        doc.text(
            `Tổng tiền: ${invoice.tongTien?.toLocaleString()} VNĐ`,
            14,
            doc.lastAutoTable.finalY + 10
        );
        doc.save("hoa_don.pdf");
    };

    // Tính tổng tiền chưa tính phụ phí
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
                <h2>Xem trước hóa đơn</h2>
                {/* Thông tin khách hàng */}
                <h3 style={{ marginTop: 0 }}>I. Thông tin khách hàng</h3>
                <div style={{ marginBottom: 16 }}>
                    <b>Họ tên:</b> {contract.khachHang?.hoTen} <br />
                    <b>Địa chỉ:</b> {contract.khachHang?.diaChi?.soNha},{" "}
                    {contract.khachHang?.diaChi?.phuong},{" "}
                    {contract.khachHang?.diaChi?.quan},{" "}
                    {contract.khachHang?.diaChi?.tinh} <br />
                    <b>SĐT:</b>{" "}
                    {contract.khachHang?.sdt || contract.khachHang?.soDienThoai}{" "}
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
                    <b>Hãng xe:</b> {contract.oto?.mauXe?.hangXe?.ten} <br />
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
                    {contract.checkin
                        ? new Date(contract.checkin).toLocaleString()
                        : ""}
                </div>
                <div style={{ marginBottom: 16 }}>
                    <b>Ngày kết thúc:</b>{" "}
                    {contract.checkout
                        ? new Date(contract.checkout).toLocaleString()
                        : ""}
                </div>
                <div style={{ marginBottom: 16 }}>
                    <b>Ngày thanh toán:</b>{" "}
                    {new Date(invoice.ngayThanhToan).toISOString().slice(0, 10)}
                </div>
                <div style={{ marginBottom: 16 }}>
                    <b>Phương thức thanh toán:</b> {invoice.phuongThucThanhToan}
                </div>
                <div style={{ marginBottom: 16 }}>
                    <b>Ghi chú:</b> {invoice.ghiChu}
                </div>
                {/* Phụ phí */}
                <h3>V. Phụ phí có thể phát sinh</h3>
                <div style={{ marginBottom: 12 }}>
                    <b>Bảng phụ phí:</b>
                    <table className="contract-table" style={{ marginTop: 8 }}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên phụ phí</th>
                                <th>Số lượng</th>
                                <th>Đơn vị</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {phuPhiList.map((phi, idx) => {
                                let soLuong = 1;
                                let donVi = "VNĐ";
                                if (
                                    phi.ten?.toLowerCase().includes("giới hạn")
                                ) {
                                    soLuong = vuotKm;
                                    donVi = "km";
                                }
                                if (
                                    phi.ten?.toLowerCase().includes("quá giờ")
                                ) {
                                    soLuong = vuotGio;
                                    donVi = "giờ";
                                }

                                return (
                                    <tr key={phi.id}>
                                        <td>{idx + 1}</td>
                                        <td>{phi.ten}</td>
                                        <td>{soLuong}</td>
                                        <td>{donVi}</td>
                                        <td>{phi.gia?.toLocaleString()}</td>
                                        <td>
                                            {(
                                                (phi.gia || 0) * soLuong
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <b>Tổng tiền chưa tính phụ phí:</b>{" "}
                    {tongTienChuaPhuPhi.toLocaleString()} VNĐ
                </div>
                <div style={{ marginBottom: 24, fontSize: 20 }}>
                    <b>Tổng tiền:</b> {invoice.tongTien?.toLocaleString()} VNĐ
                </div>
                <button
                    className="contract-btn contract-btn-approve"
                    onClick={handlePrint}
                >
                    In hóa đơn
                </button>
            </div>
            <Footer />
        </div>
    );
}

export default InvoicePreviewPage;
