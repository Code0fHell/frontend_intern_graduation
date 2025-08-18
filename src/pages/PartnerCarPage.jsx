// filepath: d:\react\frontend\src\components\PartnerCarPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/PartnerCarPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function PartnerCarPage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [cars, setCars] = useState([]);
    const [carImages, setCarImages] = useState({});
    const navigate = useNavigate();
    console.log("cars: " + JSON.stringify(cars));

    useEffect(() => {
        axios
            .get(`http://localhost:8080/cars/doi-tac/${user.id}`)
            .then((res) => setCars(res.data))
            .catch(() => setCars([]));
    }, [user.id]);

    useEffect(() => {
        axios
            .get(`http://localhost:8080/cars/doi-tac/${user.id}`)
            .then(async (res) => {
                setCars(res.data);

                const imagePromises = res.data.map((car) =>
                    axios
                        .get(
                            `http://localhost:8080/api/renting/cars/${car.id}/images`
                        )
                        .then((imgRes) => ({
                            id: car.id,
                            images: imgRes.data.map(
                                (filename) =>
                                    `http://localhost:8080/images/${filename}`
                            ),
                        }))
                        .catch(() => ({ id: car.id, images: [] }))
                );
                const imagesArr = await Promise.all(imagePromises);
                const imagesObj = {};
                imagesArr.forEach((item) => {
                    imagesObj[item.id] = item.images;
                });
                setCarImages(imagesObj);
            })
            .catch(() => {
                setCars([]);
                setCarImages({});
            });
    }, [user.id]);

    // Hàm chuyển sang trang chi tiết xe, chỉ cho phép nếu chưa hết hạn hợp đồng
    const handleCarDetail = (car) => {
        if (car.trangThai !== "HET_HAN_HOP_DONG") {
            navigate(`/partner/car-detail/${car.id}`, { state: { car } });
        }
    };

    return (
        <div className="partner-car-root">
            <Header />
            <div className="partner-car-page-container">
                <div className="partner-car-page-title">
                    Danh sách xe của bạn
                </div>
                <div className="partner-car-card-list">
                    {cars.map((car) => (
                        <div
                            className="partner-car-card"
                            key={car.id}
                            onClick={() => handleCarDetail(car)}
                            style={{
                                cursor:
                                    car.trangThai === "HET_HAN_HOP_DONG"
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    car.trangThai === "HET_HAN_HOP_DONG"
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            <div className="partner-car-card-img">
                                <img
                                    src={
                                        carImages[car.id] || "/no-image-car.png"
                                    }
                                    alt="Ảnh xe"
                                    style={{
                                        width: "100%",
                                        height: 140,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                />
                            </div>
                            <div className="partner-car-card-info">
                                <div className="partner-car-card-title">
                                    <b>
                                        {car.mauXe?.hangXe?.ten}{" "}
                                        {car.mauXe?.ten}
                                    </b>
                                </div>
                                <div>Mẫu xe: {car.mauXe?.ten}</div>
                                <div>Số ghế: {car.mauXe?.soGhe}</div>
                                <div>Loại nhiên liệu: {car.loaiNhienLieu}</div>
                                <div>Truyền động: {car.truyenDong}</div>
                                <div>Tiêu hao: {car.mucTieuThu} L/km</div>
                                <div>
                                    <span
                                        className={
                                            "partner-car-status " +
                                            (car.trangThai === "CHO_DUYET"
                                                ? "waiting"
                                                : car.trangThai === "OK"
                                                ? "active"
                                                : car.trangThai ===
                                                  "HET_HAN_HOP_DONG"
                                                ? "danger"
                                                : "")
                                        }
                                    >
                                        {car.trangThai === "CHO_DUYET"
                                            ? "Chờ duyệt"
                                            : car.trangThai === "OK"
                                            ? "Hoạt động"
                                            : car.trangThai ===
                                              "HET_HAN_HOP_DONG"
                                            ? "Hết hạn hợp đồng"
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PartnerCarPage;
