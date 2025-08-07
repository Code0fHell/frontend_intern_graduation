import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/AdminCarListPage.css";

function AdminCarListPage() {
    const [carsChoDuyet, setCarsChoDuyet] = useState([]);
    const [carsHoatDong, setCarsHoatDong] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editGiaId, setEditGiaId] = useState(null);
    const [editGiaValue, setEditGiaValue] = useState("");
    const [tienNghiMap, setTienNghiMap] = useState({}); // { carId: [id, ...] }

    useEffect(() => {
        fetchCars();
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

    const handleEditGia = (car) => {
        setEditGiaId(car.id);
        setEditGiaValue(car.gia || "");
    };

    const handleGiaChange = (e) => {
        let value = e.target.value.replace(/[^0-9.]/g, "");
        // Đảm bảo chỉ có 1 dấu chấm
        const parts = value.split(".");
        if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
        }
        setEditGiaValue(value);
    };

    const handleSaveGia = async (car) => {
        try {
            await axios.put(
                `http://localhost:8080/cars/${car.id}`,
                buildOtoRequestDto(car, { gia: parseFloat(editGiaValue) })
            );
            setEditGiaId(null);
            fetchCars();
        } catch {
            alert("Cập nhật giá thất bại!");
        }
    };

    return (
        <div className="admin-car-root">
            <Header />
            <div className="admin-car-list-container">
                <h2>Danh sách xe chờ duyệt</h2>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="admin-car-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Hãng xe</th>
                                <th>Mẫu xe</th>
                                <th>Biển số</th>
                                <th>Địa chỉ</th>
                                <th>Giá thuê</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carsChoDuyet.map((car, idx) => (
                                <tr key={car.id}>
                                    <td>{idx + 1}</td>
                                    <td>{car.mauXe?.hangXe?.ten}</td>
                                    <td>{car.mauXe?.ten}</td>
                                    <td>{car.bienSo}</td>
                                    <td>
                                        {car.diaChi?.soNha},{" "}
                                        {car.diaChi?.phuong}, {car.diaChi?.quan}
                                        , {car.diaChi?.tinh}
                                    </td>
                                    <td>
                                        {editGiaId === car.id ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={editGiaValue}
                                                    onChange={handleGiaChange}
                                                    style={{ width: 100 }}
                                                />
                                                <button
                                                    style={{ marginLeft: 8 }}
                                                    onClick={() =>
                                                        handleSaveGia(car)
                                                    }
                                                >
                                                    Lưu
                                                </button>
                                                <button
                                                    style={{ marginLeft: 4 }}
                                                    onClick={() =>
                                                        setEditGiaId(null)
                                                    }
                                                >
                                                    Hủy
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {car.gia?.toLocaleString() ||
                                                    "Chưa có"}
                                                <button
                                                    style={{ marginLeft: 8 }}
                                                    onClick={() =>
                                                        handleEditGia(car)
                                                    }
                                                >
                                                    Sửa
                                                </button>
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        {car.trangThai === "CHO_DUYET"
                                            ? "Chờ duyệt"
                                            : car.trangThai === "HOAT_DONG"
                                            ? "Hoạt động"
                                            : car.trangThai}
                                    </td>
                                    <td>
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <h2 style={{ marginTop: 40 }}>Danh sách xe đang hoạt động</h2>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="admin-car-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Hãng xe</th>
                                <th>Mẫu xe</th>
                                <th>Biển số</th>
                                <th>Địa chỉ</th>
                                <th>Giá thuê</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carsHoatDong.map((car, idx) => (
                                <tr key={car.id}>
                                    <td>{idx + 1}</td>
                                    <td>{car.mauXe?.hangXe?.ten}</td>
                                    <td>{car.mauXe?.ten}</td>
                                    <td>{car.bienSo}</td>
                                    <td>
                                        {car.diaChi?.soNha},{" "}
                                        {car.diaChi?.phuong}, {car.diaChi?.quan}
                                        , {car.diaChi?.tinh}
                                    </td>
                                    <td>
                                        {car.gia?.toLocaleString() || "Chưa có"}
                                    </td>
                                    <td>
                                        {car.trangThai === "OK"
                                            ? "Hoạt động"
                                            : car.trangThai}
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
