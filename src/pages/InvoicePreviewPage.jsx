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

        // Dùng font times để giữ dấu tiếng Việt
        doc.setFont("be vietnam", "normal");

        doc.setFontSize(18);
        doc.text("HÓA ĐƠN THANH LÝ HỢP ĐỒNG", 70, 18);
        doc.setFontSize(12);
        doc.text(`Khách hàng: ${contract.khachHang?.hoTen || ""}`, 14, 30);
        doc.text(
            `Xe: ${contract.oto?.bienSo || ""} - ${
                contract.oto?.mauXe?.ten || ""
            }`,
            14,
            38
        );
        doc.text(
            `Ngày thanh toán: ${new Date(invoice.ngayThanhToan)
                .toISOString()
                .slice(0, 10)}`,
            14,
            46
        );
        doc.text(
            `Phương thức thanh toán: ${invoice.phuongThucThanhToan || ""}`,
            14,
            54
        );
        doc.text(`Ghi chú: ${invoice.ghiChu || ""}`, 14, 62);

        autoTable(doc, {
            startY: 70,
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
            styles: { font: "be vietnam" }, // Dùng font times cho bảng
        });

        doc.text(
            `Giá thuê: ${contract.gia?.toLocaleString()} VNĐ`,
            14,
            doc.lastAutoTable.finalY + 10
        );
        doc.text(
            `Tổng tiền: ${invoice.tongTien?.toLocaleString()} VNĐ`,
            14,
            doc.lastAutoTable.finalY + 18
        );
        doc.save("hoa_don.pdf");
    };

    return (
        <div className="contract-root">
            <Header />
            <div className="contract-detail-container contract-detail-large">
                <h2>Xem trước hóa đơn</h2>
                <div style={{ marginBottom: 12 }}>
                    <b>Khách hàng:</b> {contract.khachHang?.hoTen}
                </div>
                <div style={{ marginBottom: 12 }}>
                    <b>Xe:</b> {contract.oto?.bienSo} -{" "}
                    {contract.oto?.mauXe?.hangXe?.ten} {contract.oto?.mauXe?.ten}
                </div>
                <div style={{ marginBottom: 12 }}>
                    <b>Ngày thanh toán:</b>{" "}
                    {new Date(invoice.ngayThanhToan).toISOString().slice(0, 10)}
                </div>
                <div style={{ marginBottom: 12 }}>
                    <b>Phương thức thanh toán:</b> {invoice.phuongThucThanhToan}
                </div>
                <div style={{ marginBottom: 12 }}>
                    <b>Ghi chú:</b> {invoice.ghiChu}
                </div>
                <div style={{ marginBottom: 12 }}>
                    <b>Giá thuê:</b> {contract.gia?.toLocaleString()} VNĐ
                </div>
                <div style={{ marginBottom: 12 }}>
                    <b>Phụ phí:</b>
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
                                let donVi = "";
                                donVi = "VNĐ";
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
