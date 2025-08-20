import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function InvoiceListPage() {
    // State cho hóa đơn khách hàng
    const [customerInvoices, setCustomerInvoices] = useState([]);
    const [customerFilter, setCustomerFilter] = useState({
        ngayThanhToan: "",
        sdt: "",
        ten: "",
        phuongThuc: "",
    });

    // State cho hóa đơn đối tác
    const [partnerInvoices, setPartnerInvoices] = useState([]);
    const [partnerFilter, setPartnerFilter] = useState({
        ngayThanhToan: "",
        sdt: "",
        ten: "",
        phuongThuc: "",
    });

    const navigate = useNavigate();

    // Lấy hóa đơn khách hàng
    useEffect(() => {
        axios
            .get("http://localhost:8080/api/hoa-don/all")
            .then((res) => setCustomerInvoices(res.data || []));
    }, []);

    // Lấy hóa đơn đối tác
    useEffect(() => {
        axios
            .get("http://localhost:8080/hoa-don-doi-tac/all")
            .then((res) => setPartnerInvoices(res.data || []));
    }, []);
    console.log("partner : " + JSON.stringify(partnerInvoices));

    // Lọc hóa đơn khách hàng
    const filteredCustomerInvoices = customerInvoices.filter((inv) => {
        const matchDate =
            !customerFilter.ngayThanhToan ||
            (inv.ngayThanhToan &&
                new Date(inv.ngayThanhToan).toISOString().slice(0, 10) ===
                    customerFilter.ngayThanhToan);
        const matchSdt =
            !customerFilter.sdt ||
            (
                inv?.hopDongThue.khachHang?.sdt ||
                inv.khachHang?.soDienThoai ||
                ""
            ).includes(customerFilter.sdt);
        const matchTen =
            !customerFilter.ten ||
            (inv?.hopDongThue.khachHang?.hoTen || "")
                .toLowerCase()
                .includes(customerFilter.ten.toLowerCase());
        const matchPhuongThuc =
            !customerFilter.phuongThuc ||
            inv.phuongThucThanhToan === customerFilter.phuongThuc;
        return matchDate && matchSdt && matchTen && matchPhuongThuc;
    });

    // Lọc hóa đơn đối tác
    const filteredPartnerInvoices = partnerInvoices.filter((inv) => {
        const matchDate =
            !partnerFilter.ngayThanhToan ||
            (inv.ngayThanhToan &&
                new Date(inv.ngayThanhToan).toISOString().slice(0, 10) ===
                    partnerFilter.ngayThanhToan);
        const matchSdt =
            !partnerFilter.sdt ||
            (inv?.hopDongThue.doiTac?.sdt || "").includes(partnerFilter.sdt);
        const matchTen =
            !partnerFilter.ten ||
            (inv?.hopDongThue.doiTac?.hoTen || "")
                .toLowerCase()
                .includes(partnerFilter.ten.toLowerCase());
        const matchPhuongThuc =
            !partnerFilter.phuongThuc ||
            inv.phuongThucThanhToan === partnerFilter.phuongThuc;
        return matchDate && matchSdt && matchTen && matchPhuongThuc;
    });

    return (
        <>
            <Header />
            <div
                className="invoice-list-container"
                style={{ minHeight: "80vh", padding: 24 }}
            >
                <h2>Hóa đơn thanh toán khách hàng</h2>
                <div
                    className="contract-filter-row"
                    style={{ marginBottom: 16 }}
                >
                    <div>
                        <label>Ngày thanh toán</label>
                        <input
                            type="date"
                            value={customerFilter.ngayThanhToan}
                            onChange={(e) =>
                                setCustomerFilter({
                                    ...customerFilter,
                                    ngayThanhToan: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label>Số điện thoại</label>
                        <input
                            type="text"
                            value={customerFilter.sdt}
                            onChange={(e) =>
                                setCustomerFilter({
                                    ...customerFilter,
                                    sdt: e.target.value,
                                })
                            }
                            placeholder="Nhập SĐT khách hàng"
                        />
                    </div>
                    <div>
                        <label>Tên khách hàng</label>
                        <input
                            type="text"
                            value={customerFilter.ten}
                            onChange={(e) =>
                                setCustomerFilter({
                                    ...customerFilter,
                                    ten: e.target.value,
                                })
                            }
                            placeholder="Nhập tên khách hàng"
                        />
                    </div>
                    <div>
                        <label>Phương thức thanh toán</label>
                        <select
                            value={customerFilter.phuongThuc}
                            onChange={(e) =>
                                setCustomerFilter({
                                    ...customerFilter,
                                    phuongThuc: e.target.value,
                                })
                            }
                        >
                            <option value="">Tất cả</option>
                            <option value="Tiền mặt">Tiền mặt</option>
                            <option value="Chuyển khoản">Chuyển khoản</option>
                        </select>
                    </div>
                </div>
                <table className="contract-partner-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Khách hàng</th>
                            <th>SĐT</th>
                            <th>Ngày thanh toán</th>
                            <th>Tổng tiền</th>
                            <th>Phương thức</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomerInvoices.map((inv, idx) => (
                            <tr key={inv.id}>
                                <td>{idx + 1}</td>
                                <td>{inv.hopDongThue?.khachHang?.hoTen}</td>
                                <td>{inv.hopDongThue?.khachHang?.sdt}</td>
                                <td>
                                    {inv.ngayThanhToan
                                        ? new Date(
                                              inv.ngayThanhToan
                                          ).toLocaleDateString()
                                        : ""}
                                </td>
                                <td>{inv.tongTien?.toLocaleString()} VNĐ</td>
                                <td>{inv.phuongThucThanhToan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2 style={{ marginTop: 40 }}>Hóa đơn thanh toán đối tác</h2>
                <div
                    className="contract-filter-row"
                    style={{ marginBottom: 16 }}
                >
                    <div>
                        <label>Ngày thanh toán</label>
                        <input
                            type="date"
                            value={partnerFilter.ngayThanhToan}
                            onChange={(e) =>
                                setPartnerFilter({
                                    ...partnerFilter,
                                    ngayThanhToan: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label>Số điện thoại đối tác</label>
                        <input
                            type="text"
                            value={partnerFilter.sdt}
                            onChange={(e) =>
                                setPartnerFilter({
                                    ...partnerFilter,
                                    sdt: e.target.value,
                                })
                            }
                            placeholder="Nhập SĐT đối tác"
                        />
                    </div>
                    <div>
                        <label>Tên đối tác</label>
                        <input
                            type="text"
                            value={partnerFilter.ten}
                            onChange={(e) =>
                                setPartnerFilter({
                                    ...partnerFilter,
                                    ten: e.target.value,
                                })
                            }
                            placeholder="Nhập tên đối tác"
                        />
                    </div>
                    <div>
                        <label>Phương thức thanh toán</label>
                        <select
                            value={partnerFilter.phuongThuc}
                            onChange={(e) =>
                                setPartnerFilter({
                                    ...partnerFilter,
                                    phuongThuc: e.target.value,
                                })
                            }
                        >
                            <option value="">Tất cả</option>
                            <option value="Tiền mặt">Tiền mặt</option>
                            <option value="Chuyển khoản">Chuyển khoản</option>
                            <option value="Ví điện tử">Ví điện tử</option>
                        </select>
                    </div>
                </div>
                <table className="contract-partner-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Đối tác</th>
                            <th>SĐT</th>
                            <th>Ngày thanh toán</th>
                            <th>Tổng tiền</th>
                            <th>Phương thức</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPartnerInvoices.map((inv, idx) => (
                            <tr key={inv.id}>
                                <td>{idx + 1}</td>
                                <td>
                                    {inv?.hopDongChoThue?.oto?.doiTac?.hoTen}
                                </td>
                                <td>{inv?.hopDongChoThue?.oto?.doiTac?.sdt}</td>
                                <td>
                                    {inv.ngayThanhToan
                                        ? new Date(
                                              inv.ngayThanhToan
                                          ).toLocaleDateString()
                                        : ""}
                                </td>
                                <td>{inv.tongTien?.toLocaleString()} VNĐ</td>
                                <td>{inv.phuongThucThanhToan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Footer />
        </>
    );
}

export default InvoiceListPage;
