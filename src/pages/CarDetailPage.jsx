import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CarDetailPage.css";
import { useAuth } from "../contexts/AuthContext";

function CarDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Lấy thông tin truyền từ CarListPage
    const carInfo = location.state?.carInfo || {};

    const [images, setImages] = useState([]);
    const [tienNghi, setTienNghi] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedImg, setSelectedImg] = useState(0);
    const [ngayNhan, setNgayNhan] = useState("");
    const [ngayTra, setNgayTra] = useState("");

    // Tính số ngày thuê và tổng tiền thuê xe
    let soNgayThue = 0;
    let tongTien = 0;
    if (ngayNhan && ngayTra) {
        const nhan = new Date(ngayNhan);
        const tra = new Date(ngayTra);
        // Tính số ngày, làm tròn lên nếu có giờ lẻ
        const msPerDay = 1000 * 60 * 60 * 24;
        soNgayThue = Math.ceil((tra - nhan) / msPerDay);
        if (soNgayThue < 1) soNgayThue = 1;
        tongTien = soNgayThue * (carInfo.gia || 0);
    }
    console.log("images: " + JSON.stringify(images));

    useEffect(() => {
        // Lấy ảnh xe, chỉ hiển thị ảnh có thuộc tính thumnail, không hiển thị ảnh giayToXe
        axios
            .get(`http://localhost:8080/api/renting/cars/${id}/images/thumnail`)
            .then((res) => {
                const filteredImages = res.data
                    .map((filename) => `http://localhost:8080/images/${filename}`
                    );
                setImages(filteredImages);
            })
            .catch(() => setImages([]));

        // Lấy tiện nghi xe
        axios
            .get(`http://localhost:8080/api/renting/cars/${id}/tien-nghi`)
            .then((res) => setTienNghi(res.data.map((tn) => tn.ten)))
            .catch(() => setTienNghi([]));

        // Lấy nhận xét/đánh giá
        axios
            .get(`http://localhost:8080/api/renting/cars/${id}/reviews`)
            .then((res) => setReviews(res.data))
            .catch(() => setReviews([]));
    }, [id]);

    // Xử lý đặt thuê xe
    const handleRent = async () => {
        if (!ngayNhan || !ngayTra) {
            alert("Vui lòng chọn ngày nhận và ngày trả xe!");
            return;
        }
        if (!user?.id) {
            alert("Bạn cần đăng nhập để đặt thuê xe!");
            navigate("/login");
            return;
        }
        const hopDongThue = {
            otoId: id,
            khachHangId: user.id,
            thoiGianNhan: new Date(ngayNhan).getTime(),
            thoiGianTra: new Date(ngayTra).getTime(),
            moTa: carInfo.moTa,
            giaThue: carInfo.gia,
        };
        console.log("hopdong: " + JSON.stringify(hopDongThue));
        try {
            await axios.post(
                "http://localhost:8080/api/hop-dong-thue",
                hopDongThue
            );
            alert("Đặt thuê thành công!");
            navigate("/contracts_customer");
        } catch (error) {
            alert("Lỗi kết nối server hoặc dữ liệu không hợp lệ!");
        }
    };

    const isStaff = user?.id?.includes("NV") || location.state?.isStaff;

    return (
        <div className="car-detail-root">
            <Header />
            <main className="car-detail-main">
                {/* Gallery */}
                <div className="car-detail-gallery car-detail-gallery-top">
                    <div className="car-detail-gallery-main">
                        <img
                            src={images[selectedImg] || "/default-car.png"}
                            alt={carInfo.mauXe}
                            className="car-detail-img"
                        />
                    </div>
                    <div className="car-detail-gallery-thumbs">
                        {images.slice(0, 4).map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`thumb-${idx}`}
                                className={`car-detail-thumb${
                                    selectedImg === idx ? " selected" : ""
                                }`}
                                onClick={() => setSelectedImg(idx)}
                            />
                        ))}
                        {images.length > 4 && (
                            <button className="car-detail-gallery-all">
                                Xem tất cả ảnh
                            </button>
                        )}
                    </div>
                </div>
                <div className="car-detail-content">
                    {/* Left Column */}
                    <div className="car-detail-left">
                        <h2 className="car-detail-title">
                            {carInfo.hangXe} {carInfo.mauXe}
                            <span className="car-detail-star">★ 5.0</span>
                        </h2>
                        <div className="car-detail-section">
                            <div className="car-detail-label">Đặc điểm</div>
                            <ul className="car-detail-features">
                                <li>Truyền động: {carInfo.truyenDong}</li>
                                <li>Số ghế: {carInfo.soGhe}</li>
                                <li>Nhiên liệu: {carInfo.nhienLieu}</li>
                                <li>Tiêu hao: {carInfo.mucTieuThu}L/100km</li>
                            </ul>
                        </div>
                        <div className="car-detail-section">
                            <div className="car-detail-label">Mô tả</div>
                            <div>{carInfo.moTa}</div>
                        </div>
                        <div className="car-detail-section">
                            <div className="car-detail-label">
                                Các tiện nghi khác
                            </div>
                            <ul>
                                {tienNghi.map((t, i) => (
                                    <li key={i}>{t}</li>
                                ))}
                            </ul>
                        </div>
                        {/* Comment Section */}
                        <div className="car-detail-section">
                            <div className="car-detail-label">Đánh giá xe</div>
                            <div className="car-detail-comments-list">
                                {reviews.length === 0 && (
                                    <div>Chưa có đánh giá nào.</div>
                                )}
                                {reviews.map((c, idx) => (
                                    <div
                                        key={idx}
                                        className="car-detail-comment"
                                    >
                                        <div className="car-detail-comment-user">
                                            {c.tenKhachHang}
                                        </div>
                                        <div className="car-detail-comment-content">
                                            {c.khachHangDanhGiaChu}
                                        </div>
                                        <div className="car-detail-comment-date">
                                            {c.khachHangDanhGiaSo
                                                ? `${c.khachHangDanhGiaSo} ★`
                                                : ""}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="car-detail-right">
                        {!isStaff && (
                            <>
                                <div className="car-detail-total">
                                    <div>Tổng tiền thuê xe</div>
                                    <div className="car-detail-total-value">
                                        {tongTien.toLocaleString()}đ
                                        {soNgayThue > 0 && (
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    color: "#888",
                                                    marginLeft: 6,
                                                }}
                                            >
                                                ({soNgayThue} ngày)
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="car-detail-section">
                                    <label>Ngày nhận xe</label>
                                    <input
                                        type="datetime-local"
                                        value={ngayNhan}
                                        onChange={(e) =>
                                            setNgayNhan(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="car-detail-section">
                                    <label>Ngày trả xe</label>
                                    <input
                                        type="datetime-local"
                                        value={ngayTra}
                                        onChange={(e) =>
                                            setNgayTra(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="car-detail-section">
                                    <div>Đơn giá thuê</div>
                                    <div>
                                        {carInfo.gia?.toLocaleString()}đ/ngày
                                    </div>
                                </div>
                                <button
                                    className="car-detail-btn"
                                    onClick={handleRent}
                                >
                                    Đặt thuê
                                </button>
                                {/* Phụ phí phát sinh giữ nguyên */}
                                <div className="car-detail-section">
                                    <div
                                        className="car-detail-label"
                                        style={{ color: "#4caf50" }}
                                    >
                                        Phụ phí có thể phát sinh
                                    </div>
                                    <ul className="car-detail-fee-list">
                                        <li>
                                            <b>Phí vượt giới hạn</b>
                                            <span className="car-detail-fee-value">
                                                3.000đ/km
                                            </span>
                                            <div className="car-detail-fee-desc">
                                                Phí phát sinh nếu lộ trình di
                                                chuyển vượt quá 350km khi thuê
                                                xe 1 ngày
                                            </div>
                                        </li>
                                        <li>
                                            <b>Phí quá giờ</b>
                                            <span className="car-detail-fee-value">
                                                70.000đ/giờ
                                            </span>
                                            <div className="car-detail-fee-desc">
                                                Phí phát sinh nếu hoàn trả xe
                                                trễ giờ. Trường hợp trễ quá 4
                                                giờ, phí tính thêm 1 ngày thuê
                                            </div>
                                        </li>
                                        <li>
                                            <b>Phí vệ sinh</b>
                                            <span className="car-detail-fee-value">
                                                70.000đ
                                            </span>
                                            <div className="car-detail-fee-desc">
                                                Phí phát sinh khi xe hoàn trả
                                                không đảm bảo vệ sinh (nhiều vết
                                                bẩn, bùn cát, sinh lầy...)
                                            </div>
                                        </li>
                                        <li>
                                            <b>Phí khử mùi</b>
                                            <span className="car-detail-fee-value">
                                                500.000đ
                                            </span>
                                            <div className="car-detail-fee-desc">
                                                Phí phát sinh khi xe hoàn trả bị
                                                ám mùi khó chịu (mùi thuốc lá,
                                                thực phẩm nặng mùi...)
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        )}
                        {isStaff && (
                            <button
                                className="car-detail-btn"
                                onClick={() =>
                                    navigate(`/create-contract/${id}`, {
                                        state: { carInfo },
                                    })
                                }
                            >
                                Tạo hợp đồng
                            </button>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CarDetailPage;
