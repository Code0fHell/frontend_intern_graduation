import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/EmployeeCarListPage.css";

function EmployeeCarListPage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    console.log("cars: " + JSON.stringify(cars));
    useEffect(() => {
        // Lấy danh sách xe đang hoạt động (trạng thái OK)
        axios
            .get("http://localhost:8080/api/renting/get-all-cars")
            .then((res) => {
                const carList = Array.isArray(res.data) ? res.data : [];
                // Lọc xe của đối tác và trạng thái OK (hoạt động)
                const activePartnerCars = carList.filter(
                    (car) =>
                        car.doiTac &&
                        car.doiTac.id &&
                        (car.trangThai === "OK" ||
                            car.trangThai === "HOAT_DONG")
                );
                setCars(activePartnerCars);
                setLoading(false);
            })
            .catch(() => {
                setCars([]);
                setLoading(false);
            });
    }, []);

    return (
        <div className="employee-car-root">
            <Header />
            <div className="employee-car-list-container">
                <h2>Danh sách xe đối tác đang hoạt động</h2>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="employee-car-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Hãng xe</th>
                                <th>Mẫu xe</th>
                                <th>Biển số</th>
                                <th>Địa chỉ</th>
                                <th>Giá thuê</th>
                                <th>Chủ xe</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cars.map((car, idx) => (
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
                                    <td>{car.doiTac?.hoTen || "Không rõ"}</td>
                                    <td>
                                        {car.trangThai === "OK"
                                            ? "Hoạt động"
                                            : car.trangThai}
                                    </td>
                                    <td>
                                            <button
                                                className="employee-car-action-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/create-contract/${car.id}`,
                                                        {
                                                            state: {
                                                                carInfo: {
                                                                    hangXe: car?.mauXe?.hangXe?.ten,
                                                                    mauXe: car?.mauXe?.ten,
                                                                    soGhe: car?.mauXe?.soGhe,
                                                                    truyenDong: car.truyenDong,
                                                                    moTa: car.moTa,
                                                                    diaChi: `${car?.diaChi.soNha}, ${car?.diaChi.phuong}, ${car?.diaChi.quan}, ${car?.diaChi.tinh}`,
                                                                    nhienLieu: car?.loaiNhienLieu,
                                                                    mucTieuThu: car?.mucTieuThu,
                                                                    gia: car.gia,
                                                                    partner: {
                                                                        id: car?.doiTac?.id,
                                                                        ten: car?.doiTac?.hoTen,
                                                                        sdt: car?.doiTac?.sdt,
                                                                        diaChi: car?.doiTac?.diaChi,
                                                                    },
                                                                }
                                                            },
                                                        }
                                                    )
                                                }
                                            >
                                                Tạo hợp đồng
                                            </button>
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

export default EmployeeCarListPage;
