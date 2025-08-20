import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/AdminCarListPage.css";

// Hàm lấy màu cho trạng thái xe
function getStatusColor(status) {
    switch (status) {
        case "CHO_DUYET":
            return { background: "#fde68a", color: "#b45309" }; // vàng
        case "OK":
            return { background: "#bbf7d0", color: "#166534" }; // xanh lá
        case "HET_HAN_HOP_DONG":
            return { background: "#fecaca", color: "#991b1b" }; // đỏ nhạt
        default:
            return { background: "#e0e7ef", color: "#334155" }; // xám
    }
}

function AdminCarListPage() {
    const navigate = useNavigate();
    const [carsChoDuyet, setCarsChoDuyet] = useState([]);
    const [carsHoatDong, setCarsHoatDong] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tienNghiMap, setTienNghiMap] = useState({});
    const [contracts, setContracts] = useState([]);

    // Bộ lọc cho xe chờ duyệt
    const [filterChoDuyet, setFilterChoDuyet] = useState({
        bienSo: "",
        tenDoiTac: "",
        ngayDangKy: "",
    });
    // Bộ lọc cho xe hoạt động
    const [filterHoatDong, setFilterHoatDong] = useState({
        bienSo: "",
        tenDoiTac: "",
        ngayDangKy: "",
    });

    useEffect(() => {
        fetchCars();
        fetchContracts();
    }, []);

    // Lấy cả xe chờ duyệt và xe hoạt động
    const fetchCars = async () => {
        setLoading(true);
        try {
            // Lấy xe chờ duyệt
            const resChoDuyet = await axios.get(
                "http://localhost:8080/cars/cho-duyet"
            );
            setCarsChoDuyet(resChoDuyet.data);

            // Lấy tiện nghi cho từng xe chờ duyệt
            const promisesChoDuyet = resChoDuyet.data.map((car) =>
                axios
                    .get(
                        `http://localhost:8080/api/renting/cars/${car.id}/tien-nghi`
                    )
                    .then((resTn) => ({
                        carId: car.id,
                        tienNghi: resTn.data.map((tn) => tn.id),
                    }))
                    .catch(() => ({ carId: car.id, tienNghi: [] }))
            );
            const allTienNghiChoDuyet = await Promise.all(promisesChoDuyet);

            // Lấy xe hoạt động
            const resHoatDong = await axios.get(
                "http://localhost:8080/api/renting/get-all-cars"
            );
            setCarsHoatDong(resHoatDong.data);

            // Lấy tiện nghi cho từng xe hoạt động
            const promisesHoatDong = resHoatDong.data.map((car) =>
                axios
                    .get(
                        `http://localhost:8080/api/renting/cars/${car.id}/tien-nghi`
                    )
                    .then((resTn) => ({
                        carId: car.id,
                        tienNghi: resTn.data.map((tn) => tn.id),
                    }))
                    .catch(() => ({ carId: car.id, tienNghi: [] }))
            );
            const allTienNghiHoatDong = await Promise.all(promisesHoatDong);

            // Gộp map tiện nghi cho cả 2 loại xe
            const map = {};
            [...allTienNghiChoDuyet, ...allTienNghiHoatDong].forEach((item) => {
                map[item.carId] = item.tienNghi;
            });
            setTienNghiMap(map);
        } catch {
            setCarsChoDuyet([]);
            setCarsHoatDong([]);
            setTienNghiMap({});
        }
        setLoading(false);
    };

    // Lấy tất cả hợp đồng cho thuê
    const fetchContracts = async () => {
        try {
            const res = await axios.get(
                "http://localhost:8080/hop-dong-cho-thue/all"
            );
            setContracts(res.data || []);
        } catch {
            setContracts([]);
        }
    };

    // Kiểm tra xe đã có hợp đồng cho thuê chưa
    const hasContract = (carId) => {
        return contracts.some((contract) => contract.oto?.id === carId);
    };

    // Chuẩn hóa dữ liệu gửi lên cho đúng OtoRequestDto
    const buildOtoRequestDto = (car, override = {}) => ({
        namSanXuat: car.namSanXuat,
        truyenDong: car.truyenDong,
        loaiNhienLieu: car.loaiNhienLieu,
        mucTieuThu: car.mucTieuThu,
        bienSo: car.bienSo,
        gia: override.gia !== undefined ? override.gia : car.gia,
        trangThai: override.trangThai || car.trangThai,
        moTa: car.moTa,
        doiTacId: car.doiTac.id,
        diaChi: {
            id: car.diaChi.id,
            tinh: car.diaChi.tinh,
            quan: car.diaChi.quan,
            phuong: car.diaChi.phuong,
            soNha: car.diaChi.soNha,
        },
        tienNghi: tienNghiMap[car.id] || [],
        mauXeId: car.mauXe.id,
    });

    const handleApprove = async (car) => {
        try {
            await axios.put(
                `http://localhost:8080/cars/${car.id}`,
                buildOtoRequestDto(car, { trangThai: "OK" })
            );
            alert("Phê duyệt thành công!");
            fetchCars();
        } catch {
            alert("Phê duyệt thất bại!");
        }
    };

    // Xem chi tiết xe
    const handleViewDetail = (car) => {
        navigate(`/partner/car-detail/${car.id}`, {
            state: { car, readOnly: true, backTo: "/admin/cars" },
        });
    };

    // Bộ lọc danh sách xe chờ duyệt
    const filteredChoDuyet = carsChoDuyet.filter((car) => {
        const matchBienSo =
            !filterChoDuyet.bienSo ||
            car.bienSo
                .toLowerCase()
                .includes(filterChoDuyet.bienSo.toLowerCase());
        const matchTenDoiTac =
            !filterChoDuyet.tenDoiTac ||
            (car.doiTac?.hoTen || "")
                .toLowerCase()
                .includes(filterChoDuyet.tenDoiTac.toLowerCase());
        const matchNgayDangKy =
            !filterChoDuyet.ngayDangKy ||
            (car.ngayTao &&
                new Date(car.ngayTao).toISOString().slice(0, 10) ===
                    filterChoDuyet.ngayDangKy);
        return matchBienSo && matchTenDoiTac && matchNgayDangKy;
    });

    // Bộ lọc danh sách xe hoạt động
    const filteredHoatDong = carsHoatDong.filter((car) => {
        const matchBienSo =
            !filterHoatDong.bienSo ||
            car.bienSo
                .toLowerCase()
                .includes(filterHoatDong.bienSo.toLowerCase());
        const matchTenDoiTac =
            !filterHoatDong.tenDoiTac ||
            (car.doiTac?.hoTen || "")
                .toLowerCase()
                .includes(filterHoatDong.tenDoiTac.toLowerCase());
        const matchNgayDangKy =
            !filterHoatDong.ngayDangKy ||
            (car.ngayTao &&
                new Date(car.ngayTao).toISOString().slice(0, 10) ===
                    filterHoatDong.ngayDangKy);
        return matchBienSo && matchTenDoiTac && matchNgayDangKy;
    });

    return (
        <div className="admin-car-root">
            <Header />
            <div className="admin-car-list-container">
                <h2>Danh sách xe chờ duyệt</h2>
                {/* Bộ lọc giữ nguyên */}
                <div
                    className="contract-filter-row"
                    style={{ marginBottom: 12, display: "flex", gap: 16 }}
                >
                    <div style={{ minWidth: 140 }}>
                        <label>Biển số</label>
                        <input
                            type="text"
                            value={filterChoDuyet.bienSo}
                            onChange={(e) =>
                                setFilterChoDuyet((f) => ({
                                    ...f,
                                    bienSo: e.target.value,
                                }))
                            }
                            placeholder="Nhập biển số"
                        />
                    </div>
                    <div style={{ minWidth: 180 }}>
                        <label>Tên đối tác</label>
                        <input
                            type="text"
                            value={filterChoDuyet.tenDoiTac}
                            onChange={(e) =>
                                setFilterChoDuyet((f) => ({
                                    ...f,
                                    tenDoiTac: e.target.value,
                                }))
                            }
                            placeholder="Nhập tên đối tác"
                        />
                    </div>
                    <div style={{ minWidth: 170 }}>
                        <label>Ngày đăng ký</label>
                        <input
                            type="date"
                            value={filterChoDuyet.ngayDangKy}
                            onChange={(e) =>
                                setFilterChoDuyet((f) => ({
                                    ...f,
                                    ngayDangKy: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="admin-car-table">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>STT</th>
                                <th style={{ width: 120 }}>Hãng xe</th>
                                <th className="mau-xe">Mẫu xe</th>
                                <th style={{ width: 110 }}>Biển số</th>
                                <th style={{ width: 220 }}>Địa chỉ</th>
                                <th style={{ width: 110 }}>Giá thuê</th>
                                <th style={{ width: 160 }}>
                                    Họ và tên đối tác
                                </th>
                                <th style={{ width: 130 }}>
                                    Số điện thoại Đối tác
                                </th>
                                <th style={{ width: 120 }}>Ngày đăng ký</th>
                                <th style={{ width: 110 }}>Trạng thái</th>
                                <th style={{ width: 110 }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChoDuyet.map((car, idx) => (
                                <tr key={car.id}>
                                    <td>{idx + 1}</td>
                                    <td>{car.mauXe?.hangXe?.ten}</td>
                                    <td className="mau-xe">{car.mauXe?.ten}</td>
                                    <td>{car.bienSo}</td>
                                    <td>
                                        {car.diaChi?.soNha},{" "}
                                        {car.diaChi?.phuong}, {car.diaChi?.quan}
                                        , {car.diaChi?.tinh}
                                    </td>
                                    <td>
                                        {car.gia?.toLocaleString() || "Chưa có"}
                                    </td>
                                    <td>{car.doiTac?.hoTen || ""}</td>
                                    <td>{car.doiTac?.sdt || ""}</td>
                                    <td>
                                        {car.ngayTao
                                            ? new Date(
                                                  car.ngayTao
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: 8,
                                                fontWeight: 500,
                                                fontSize: 15,
                                                ...getStatusColor(
                                                    car.trangThai
                                                ),
                                                display: "inline-block",
                                            }}
                                        >
                                            {car.trangThai === "CHO_DUYET"
                                                ? "Chờ duyệt"
                                                : car.trangThai === "HOAT_DONG"
                                                ? "Hoạt động"
                                                : car.trangThai}
                                        </span>
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                display: "flex",
                                                gapRight: 4,
                                            }}
                                        >
                                            <button
                                                className="admin-car-detail-btn"
                                                onClick={() =>
                                                    handleViewDetail(car)
                                                }
                                            >
                                                Chi tiết
                                            </button>
                                            {car.trangThai === "CHO_DUYET" && (
                                                <button
                                                    className="admin-car-approve-btn"
                                                    onClick={() =>
                                                        handleApprove(car)
                                                    }
                                                    disabled={!car.gia}
                                                >
                                                    Phê duyệt
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <h2 style={{ marginTop: 40 }}>Danh sách xe đang hoạt động</h2>
                {/* Bộ lọc giữ nguyên */}
                <div
                    className="contract-filter-row"
                    style={{ marginBottom: 12, display: "flex", gap: 16 }}
                >
                    <div style={{ minWidth: 140 }}>
                        <label>Biển số</label>
                        <input
                            type="text"
                            value={filterHoatDong.bienSo}
                            onChange={(e) =>
                                setFilterHoatDong((f) => ({
                                    ...f,
                                    bienSo: e.target.value,
                                }))
                            }
                            placeholder="Nhập biển số"
                        />
                    </div>
                    <div style={{ minWidth: 180 }}>
                        <label>Tên đối tác</label>
                        <input
                            type="text"
                            value={filterHoatDong.tenDoiTac}
                            onChange={(e) =>
                                setFilterHoatDong((f) => ({
                                    ...f,
                                    tenDoiTac: e.target.value,
                                }))
                            }
                            placeholder="Nhập tên đối tác"
                        />
                    </div>
                    <div style={{ minWidth: 170 }}>
                        <label>Ngày đăng ký</label>
                        <input
                            type="date"
                            value={filterHoatDong.ngayDangKy}
                            onChange={(e) =>
                                setFilterHoatDong((f) => ({
                                    ...f,
                                    ngayDangKy: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="admin-car-table">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>STT</th>
                                <th style={{ width: 120 }}>Hãng xe</th>
                                <th className="mau-xe">Mẫu xe</th>
                                <th style={{ width: 110 }}>Biển số</th>
                                <th style={{ width: 220 }}>Địa chỉ</th>
                                <th style={{ width: 110 }}>Giá thuê</th>
                                <th style={{ width: 160 }}>
                                    Họ và tên đối tác
                                </th>
                                <th style={{ width: 130 }}>
                                    Số điện thoại Đối tác
                                </th>
                                <th style={{ width: 120 }}>Ngày đăng ký</th>
                                <th style={{ width: 110 }}>Trạng thái</th>
                                <th style={{ width: 140 }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHoatDong.map((car, idx) => (
                                <tr key={car.id}>
                                    <td>{idx + 1}</td>
                                    <td>{car.mauXe?.hangXe?.ten}</td>
                                    <td className="mau-xe">{car.mauXe?.ten}</td>
                                    <td>{car.bienSo}</td>
                                    <td>
                                        {car.diaChi?.soNha},{" "}
                                        {car.diaChi?.phuong}, {car.diaChi?.quan}
                                        , {car.diaChi?.tinh}
                                    </td>
                                    <td>
                                        {car.gia?.toLocaleString() || "Chưa có"}
                                    </td>
                                    <td>{car.doiTac?.hoTen || ""}</td>
                                    <td>{car.doiTac?.sdt || ""}</td>
                                    <td>
                                        {car.ngayTao
                                            ? new Date(
                                                  car.ngayTao
                                              ).toLocaleDateString()
                                            : ""}
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: 8,
                                                fontWeight: 500,
                                                fontSize: 15,
                                                ...getStatusColor(
                                                    car.trangThai
                                                ),
                                                display: "inline-block",
                                            }}
                                        >
                                            {car.trangThai === "OK"
                                                ? "Hoạt động"
                                                : car.trangThai}
                                        </span>
                                    </td>
                                    <td>
                                        <div
                                            style={{ display: "flex", gap: 4 }}
                                        >
                                            <button
                                                className="admin-car-detail-btn"
                                                onClick={() =>
                                                    handleViewDetail(car)
                                                }
                                            >
                                                Chi tiết
                                            </button>
                                            {!hasContract(car.id) && (
                                                <button
                                                    className="admin-car-contract-btn"
                                                    style={{ marginLeft: 8 }}
                                                    onClick={() =>
                                                        navigate(
                                                            `/create-contract/${car.id}`,
                                                            {
                                                                state: {
                                                                    carInfo: {
                                                                        hangXe: car
                                                                            ?.mauXe
                                                                            ?.hangXe
                                                                            ?.ten,
                                                                        mauXe: car
                                                                            ?.mauXe
                                                                            ?.ten,
                                                                        soGhe: car
                                                                            ?.mauXe
                                                                            ?.soGhe,
                                                                        truyenDong:
                                                                            car.truyenDong,
                                                                        moTa: car.moTa,
                                                                        diaChi: `${car?.diaChi.soNha}, ${car?.diaChi.phuong}, ${car?.diaChi.quan}, ${car?.diaChi.tinh}`,
                                                                        nhienLieu:
                                                                            car?.loaiNhienLieu,
                                                                        mucTieuThu:
                                                                            car?.mucTieuThu,
                                                                        gia: car.gia,
                                                                        partner:
                                                                            {
                                                                                id: car
                                                                                    ?.doiTac
                                                                                    ?.id,
                                                                                ten: car
                                                                                    ?.doiTac
                                                                                    ?.hoTen,
                                                                                sdt: car
                                                                                    ?.doiTac
                                                                                    ?.sdt,
                                                                                diaChi: `${car?.diaChi.soNha}, ${car?.diaChi.phuong}, ${car?.diaChi.quan}, ${car?.diaChi.tinh}`,
                                                                                email: car
                                                                                    ?.doiTac
                                                                                    ?.email,
                                                                            },
                                                                    },
                                                                },
                                                            }
                                                        )
                                                    }
                                                >
                                                    Tạo hợp đồng
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default AdminCarListPage;
