import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/ContractListPage.css";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

// Hàm lấy màu cho trạng thái hợp đồng
function getStatusColor(status) {
    switch (status) {
        case "CHO_DUYET":
            return { background: "#fde68a", color: "#b45309" }; // vàng
        case "OK":
            return { background: "#bbf7d0", color: "#166534" }; // xanh lá
        case "HUY":
            return { background: "#fecaca", color: "#991b1b" }; // đỏ nhạt
        case "HET_HAN_HOP_DONG":
            return { background: "#fca5a5", color: "#991b1b" }; // đỏ
        default:
            return { background: "#e0e7ef", color: "#334155" }; // xám
    }
}

function ContractListPage_Customer() {
    const [contracts, setContracts] = useState([]);
    const [filter, setFilter] = useState({
        tenXe: "",
        ngayTu: "",
        ngayDen: "",
        tenDoiTac: "",
        bienSo: "",
    });
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

    // Bộ lọc hợp đồng
    const filteredContracts = contracts.filter((contract) => {
        // Lọc theo tên xe
        const matchTenXe =
            !filter.tenXe ||
            (contract.oto?.mauXe?.hangXe?.ten || "")
                .toLowerCase()
                .includes(filter.tenXe.toLowerCase());
        // Lọc theo tên đối tác
        const matchTenDoiTac =
            !filter.tenDoiTac ||
            (contract.oto?.doiTac?.hoTen || "")
                .toLowerCase()
                .includes(filter.tenDoiTac.toLowerCase());
        // Lọc theo biển số xe
        const matchBienSo =
            !filter.bienSo ||
            (contract.oto?.bienSo || "")
                .toLowerCase()
                .includes(filter.bienSo.toLowerCase());

        // Lọc theo khoảng thời gian: ngày nhận và ngày trả dự kiến đều nằm trong khoảng đã chọn
        let matchNgayNhanTra = true;
        if (filter.ngayTu && filter.ngayDen) {
            const nhan = contract.thoiGianNhan
                ? new Date(contract.thoiGianNhan)
                : null;
            const tra = contract.thoiGianTra
                ? new Date(contract.thoiGianTra)
                : null;
            const tu = new Date(filter.ngayTu);
            const den = new Date(filter.ngayDen);

            matchNgayNhanTra = nhan && tra && nhan >= tu && tra <= den;
        }

        return matchTenXe && matchTenDoiTac && matchBienSo && matchNgayNhanTra;
    });

    return (
        <div className="contract_root">
            <Header />
            <div className="contract-list-container">
                <h2>Danh sách hợp đồng thuê xe</h2>
                {/* Bộ lọc */}
                <div
                    className="contract-filter-row"
                    style={{
                        display: "flex",
                        gap: 16,
                        marginBottom: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <label>Hãng xe</label>
                        <input
                            type="text"
                            value={filter.tenXe}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    tenXe: e.target.value,
                                }))
                            }
                            placeholder="Nhập tên xe"
                        />
                    </div>
                    <div>
                        <label>Tên đối tác</label>
                        <input
                            type="text"
                            value={filter.tenDoiTac}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    tenDoiTac: e.target.value,
                                }))
                            }
                            placeholder="Nhập tên đối tác"
                        />
                    </div>
                    <div>
                        <label>Biển số xe</label>
                        <input
                            type="text"
                            value={filter.bienSo}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    bienSo: e.target.value,
                                }))
                            }
                            placeholder="Nhập biển số xe"
                        />
                    </div>
                    <div>
                        <label>Ngày nhận dự kiến từ</label>
                        <input
                            type="date"
                            value={filter.ngayTu}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    ngayTu: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label>Ngày trả dự kiến đến</label>
                        <input
                            type="date"
                            value={filter.ngayDen}
                            onChange={(e) =>
                                setFilter((f) => ({
                                    ...f,
                                    ngayDen: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>
                <table className="contract-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Hãng xe</th>
                            <th>Mẫu xe</th>
                            <th>Số ghế</th>
                            <th>Ngày nhận dự kiến</th>
                            <th>Ngày trả dự kiến</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Đối tác</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền dự tính</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContracts.map((contract, idx) => {
                            // Tính tổng tiền thuê
                            let tongTien = 0;
                            if (
                                contract.thoiGianNhan &&
                                contract.thoiGianTra &&
                                contract.oto?.gia
                            ) {
                                const nhan = new Date(contract.thoiGianNhan);
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
                                        navigate(`/contracts/${contract.id}`, {
                                            state: { contract },
                                        })
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>{idx + 1}</td>
                                    <td>
                                        {contract.oto?.mauXe?.hangXe?.ten || ""}
                                    </td>
                                    <td>{contract.oto?.mauXe?.ten || ""}</td>
                                    <td>{contract.oto?.mauXe?.soGhe || ""}</td>
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
                                    <td>{contract.oto?.doiTac?.hoTen}</td>
                                    <td>
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: 8,
                                                fontWeight: 500,
                                                fontSize: 15,
                                                ...getStatusColor(
                                                    contract.trangThai
                                                ),
                                                display: "inline-block",
                                            }}
                                        >
                                            {contract.trangThai === "CHO_DUYET"
                                                ? "Chờ duyệt"
                                                : contract.trangThai === "OK"
                                                ? "Hoạt động"
                                                : contract.trangThai === "HUY"
                                                ? "Đã hủy"
                                                : contract.trangThai ===
                                                  "HET_HAN_HOP_DONG"
                                                ? "Hết hạn"
                                                : ""}
                                        </span>
                                    </td>
                                    <td>
                                        {tongTien > 0
                                            ? tongTien.toLocaleString() + "đ"
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

export default ContractListPage_Customer;
