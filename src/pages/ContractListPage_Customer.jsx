import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/ContractListPage.css";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

function ContractListPage() {
    const [contracts, setContracts] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        axios
            .get(
                `http://localhost:8080/api/hop-dong-thue/khach-hang/${user.id}`
            )
            .then((res) => setContracts(res.data))
            .catch(() => setContracts([]));
    }, [user]);

    return (
        <div className="contract_root">
            <Header />
            <div className="contract-list-container">
                <h2>Danh sách hợp đồng thuê xe</h2>
                
                <table className="contract-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Hãng xe</th>
                            <th>Mẫu xe</th>
                            <th>Số ghế</th>
                            <th>Ngày nhận (KH chọn)</th>
                            <th>Ngày trả (KH chọn)</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Nhận xét</th>
                            <th>Đánh giá</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts
                            .map((contract, idx) => {
                                // Tính tổng tiền thuê
                                let tongTien = 0;
                                if (
                                    contract.thoiGianNhan &&
                                    contract.thoiGianTra &&
                                    contract.oto?.gia
                                ) {
                                    const nhan = new Date(
                                        contract.thoiGianNhan
                                    );
                                    const tra = new Date(contract.thoiGianTra);
                                    let soNgay = Math.ceil(
                                        (tra - nhan) / (1000 * 60 * 60 * 24)
                                    );
                                    if (soNgay < 1) soNgay = 1;
                                    tongTien = soNgay * contract.oto.gia;
                                }
                                return (
                                    <tr
                                        key={contract.id}
                                        onClick={() =>
                                            navigate(
                                                `/contracts/${contract.id}`,
                                                {
                                                    state: { contract },
                                                }
                                            )
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{idx + 1}</td>
                                        <td>
                                            {contract.oto?.mauXe?.hangXe?.ten ||
                                                ""}
                                        </td>
                                        <td>
                                            {contract.oto?.mauXe?.ten || ""}
                                        </td>
                                        <td>
                                            {contract.oto?.mauXe?.soGhe || ""}
                                        </td>
                                        <td>
                                            {contract.thoiGianNhan
                                                ? new Date(
                                                      contract.thoiGianNhan
                                                  ).toLocaleString()
                                                : ""}
                                        </td>
                                        <td>
                                            {contract.thoiGianTra
                                                ? new Date(
                                                      contract.thoiGianTra
                                                  ).toLocaleString()
                                                : ""}
                                        </td>
                                        <td>
                                            {contract.checkin
                                                ? new Date(
                                                      contract.checkin
                                                  ).toLocaleString()
                                                : ""}
                                        </td>
                                        <td>
                                            {contract.checkout
                                                ? new Date(
                                                      contract.checkout
                                                  ).toLocaleString()
                                                : ""}
                                        </td>
                                        <td>{contract.nhanXet || ""}</td>
                                        <td>
                                            {contract.danhGiaSo
                                                ? `${contract.danhGiaSo} ★`
                                                : ""}
                                        </td>
                                        <td>
                                            {contract.trangThai === "CHO_DUYET"
                                                ? "Chờ duyệt"
                                                : contract.trangThai === "OK"
                                                ? "Hoạt động"
                                                : contract.trangThai === "HUY"
                                                ? "Đã hủy"
                                                : ""}
                                        </td>
                                        <td>
                                            {tongTien > 0
                                                ? tongTien.toLocaleString() +
                                                  "đ"
                                                : ""}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
            <Footer />
        </div>
    );
}

export default ContractListPage;
