// filepath: d:\react\frontend\src\components\PartnerCarPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/PartnerCarPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function PartnerCarPage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [cars, setCars] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8080/cars/doi-tac/${user.id}`)
            .then(res => setCars(res.data))
            .catch(() => setCars([]));
    }, [user.id]);
    console.log("cars: ", cars);

    return (
        <div className="partner-car-root">
            <Header />
            <div className="partner-car-page-container">
                <div className="partner-car-page-title">Danh sách xe của bạn</div>
                <table className="partner-car-table">
                    <thead>
                        <tr>
                            <th>Biển số</th>
                            <th>Hãng xe</th>
                            <th>Mẫu xe</th>
                            <th>Số ghế</th>
                            <th>Năm sản xuất</th>
                            <th>Địa chỉ</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map((car) => (
                            <tr key={car.id}>
                                <td>{car.bienSo}</td>
                                <td>{car.mauXe?.hangXe?.ten || ""}</td>
                                <td>{car.mauXe?.ten || ""}</td>
                                <td>{car.mauXe?.soGhe}</td>
                                <td>{car.namSanXuat}</td>
                                <td>
                                    {[car.diaChi?.soNha, car.diaChi?.phuong, car.diaChi?.quan, car.diaChi?.tinh]
                                        .filter(Boolean)
                                        .join(", ")}
                                </td>
                                <td>
                                    <span className={
                                        "partner-car-status " +
                                        (car.trangThai === "CHO_DUYET" ? "waiting" : car.trangThai === "OK" ? "active" : "")
                                    }>
                                        {car.trangThai === "CHO_DUYET"
                                            ? "Chờ duyệt"
                                            : car.trangThai === "OK"
                                            ? "Hoạt động"
                                            : ""}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Footer />
        </div>
        
    );
}

export default PartnerCarPage;