import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/PartnerCarDetailPage.css";

function PartnerCarDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [car, setCar] = useState(location.state?.car || null);
    const [images, setImages] = useState([]);
    const [imageMeta, setImageMeta] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [addImage, setAddImage] = useState(null);
    const [addMeta, setAddMeta] = useState({
        giayToXe: false,
        thumnail: false,
        ghiChu: "",
    });
    const [loading, setLoading] = useState(false);
    const [tienNghi, setTienNghi] = useState([]);
    const [selectedImg, setSelectedImg] = useState(0);

    // Lấy thông tin xe nếu chưa có
    useEffect(() => {
        if (!car) {
            axios
                .get(`http://localhost:8080/api/renting/get-all-cars`)
                .then((res) => {
                    const found = res.data.find((c) => c.id === Number(id));
                    setCar(found || null);
                });
        }
    }, [car, id]);

    // Lấy ảnh xe và meta
    useEffect(() => {
        if (car?.id) {
            axios
                .get(`http://localhost:8080/api/renting/cars/${car.id}/images`)
                .then((res) => {
                    setImages(
                        res.data.map(
                            (filename) =>
                                `http://localhost:8080/images/${filename}`
                        )
                    );
                    setImageMeta(
                        res.data.map((filename) => ({
                            giayToXe: filename.giayToXe || false,
                            thumnail: filename.thumnail || false,
                            ghiChu: filename.ghiChu || "",
                        }))
                    );
                })
                .catch(() => {
                    setImages([]);
                    setImageMeta([]);
                });
        }
    }, [car?.id, modalOpen]);
    console.log("car: " + JSON.stringify(images));
    // Lấy tiện nghi xe
    useEffect(() => {
        if (car?.id) {
            axios
                .get(`http://localhost:8080/api/renting/cars/${id}/tien-nghi`)
                .then((res) => setTienNghi(res.data))
                .catch(() => setTienNghi([]));
        }
    }, [car?.id, id]);

    // Mở modal thêm ảnh
    const openAddModal = () => {
        setAddImage(null);
        setAddMeta({ giayToXe: false, thumnail: false, ghiChu: "" });
        setModalOpen(true);
    };

    // Đóng modal
    const closeModal = () => {
        setModalOpen(false);
    };

    // Xử lý upload ảnh như CarRegisterForm
    const handleAddImage = async () => {
        if (!addImage || !car?.id) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", addImage);
        // Truyền JSON cho anhCuaXeRequestDto
        formData.append(
            "anhCuaXeRequestDto",
            new Blob([JSON.stringify(addMeta)], { type: "application/json" })
        );
        try {
            await axios.post(
                `http://localhost:8080/image-of-car/uploads/${car.id}`,
                formData
            );
            setModalOpen(false);
            setAddImage(null);
            setAddMeta({ giayToXe: false, thumnail: false, ghiChu: "" });
            // Reload lại danh sách ảnh
            const res = await axios.get(
                `http://localhost:8080/api/renting/cars/${car.id}/images`
            );
            setImages(
                res.data.map(
                    (filename) => `http://localhost:8080/images/${filename}`
                )
            );
            setImageMeta(
                res.data.map((filename) => ({
                    giayToXe: filename.giayToXe || false,
                    thumnail: filename.thumnail || false,
                    ghiChu: filename.ghiChu || "",
                }))
            );
            alert("Thêm ảnh xe thành công!");
        } catch {
            alert("Thêm ảnh thất bại!");
        }
        setLoading(false);
    };

    if (!car) return <div>Không tìm thấy xe!</div>;

    const isDT = user?.id?.includes("DT");
    const isQL = user?.id?.includes("QL");

    return (
        <div className="car-detail-root">
            <Header />
            <main className="car-detail-main">
                {/* Gallery */}
                <div className="car-detail-gallery car-detail-gallery-top">
                    <div className="car-detail-gallery-main">
                        {/* Hiển thị ảnh được chọn hoặc mặc định */}
                        <img
                            src={images[selectedImg] || "/default-car.png"}
                            alt={car.mauXe?.ten}
                            className="car-detail-img"
                        />
                    </div>
                    <div className="car-detail-gallery-thumbs">
                        {/* Hiển thị tối đa 5 ảnh, chọn ảnh để xem lớn */}
                        {images.slice(0, 5).map((img, idx) => (
                            <div key={idx} style={{ position: "relative" }}>
                                <img
                                    src={img}
                                    alt={`thumb-${idx}`}
                                    className={`car-detail-thumb${
                                        selectedImg === idx ? " selected" : ""
                                    }`}
                                    onClick={() => setSelectedImg(idx)}
                                    style={{
                                        border:
                                            selectedImg === idx
                                                ? "2px solid #22c55e"
                                                : "2px solid #eee",
                                        cursor: "pointer",
                                    }}
                                />
                                {/* Hiển thị meta ảnh */}
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#666",
                                        marginTop: 2,
                                    }}
                                >
                                    {imageMeta[idx]?.giayToXe && (
                                        <span>Giấy tờ xe&nbsp;</span>
                                    )}
                                    {imageMeta[idx]?.thumnail && (
                                        <span>Thumbnail&nbsp;</span>
                                    )}
                                    {imageMeta[idx]?.ghiChu && (
                                        <span>({imageMeta[idx].ghiChu})</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* Chỉ đối tác mới có nút thêm ảnh */}
                        {isDT && (
                            <div
                                className="car-detail-add-thumb"
                                onClick={openAddModal}
                            >
                                +
                            </div>
                        )}
                    </div>
                </div>
                {/* Modal thêm ảnh chỉ cho đối tác */}
                {modalOpen && isDT && (
                    <div className="car-detail-modal-bg">
                        <div className="car-detail-modal">
                            <span
                                className="car-detail-modal-close"
                                onClick={closeModal}
                            >
                                &times;
                            </span>
                            <h3>Thêm ảnh xe</h3>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAddImage(e.target.files[0])}
                                disabled={loading}
                                style={{ marginBottom: 12 }}
                            />
                            <div style={{ marginBottom: 12 }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={addMeta.giayToXe}
                                        onChange={(e) =>
                                            setAddMeta((prev) => ({
                                                ...prev,
                                                giayToXe: e.target.checked,
                                            }))
                                        }
                                    />{" "}
                                    Ảnh giấy tờ xe
                                </label>
                                <label style={{ marginLeft: 24 }}>
                                    <input
                                        type="checkbox"
                                        checked={addMeta.thumnail}
                                        onChange={(e) =>
                                            setAddMeta((prev) => ({
                                                ...prev,
                                                thumnail: e.target.checked,
                                            }))
                                        }
                                    />{" "}
                                    Ảnh đại diện (thumbnail)
                                </label>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <input
                                    type="text"
                                    value={addMeta.ghiChu}
                                    onChange={(e) =>
                                        setAddMeta((prev) => ({
                                            ...prev,
                                            ghiChu: e.target.value,
                                        }))
                                    }
                                    placeholder="Ghi chú cho ảnh"
                                    style={{
                                        width: "100%",
                                        padding: 6,
                                        borderRadius: 6,
                                        border: "1px solid #eee",
                                    }}
                                />
                            </div>
                            <button
                                className="contract-btn"
                                onClick={handleAddImage}
                                disabled={loading || !addImage}
                            >
                                Thêm ảnh
                            </button>
                        </div>
                    </div>
                )}
                {/* Đặc điểm */}
                <div className="car-detail-section">
                    <div className="car-detail-label">Đặc điểm</div>
                    <ul className="car-detail-features">
                        <li>
                            <span className="car-detail-feature-title">
                                Truyền động
                            </span>
                            <br />
                            {car.truyenDong}
                        </li>
                        <li>
                            <span className="car-detail-feature-title">
                                Số ghế
                            </span>
                            <br />
                            {car.mauXe?.soGhe} chỗ
                        </li>
                        <li>
                            <span className="car-detail-feature-title">
                                Nhiên liệu
                            </span>
                            <br />
                            {car.loaiNhienLieu}
                        </li>
                        <li>
                            <span className="car-detail-feature-title">
                                Tiêu hao
                            </span>
                            <br />
                            {car.mucTieuThu}L/100km
                        </li>
                    </ul>
                </div>
                {/* Mô tả */}
                <div className="car-detail-section">
                    <div className="car-detail-label">Mô tả</div>
                    <div>{car.moTa || "Chưa có mô tả"}</div>
                </div>
                {/* Tiện nghi */}
                <div className="car-detail-section">
                    <div className="car-detail-label">Các tiện nghi khác</div>
                    <div className="car-detail-tiennghi-list">
                        {tienNghi.length === 0 && (
                            <span style={{ color: "#888" }}>
                                Chưa có tiện nghi
                            </span>
                        )}
                        {tienNghi.map((t, i) => (
                            <div className="car-detail-tiennghi-item" key={i}>
                                {t.ten || t}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Nút quay lại cho QL */}
                {isQL && (
                    <div style={{ marginTop: 32 }}>
                        <button
                            className="contract-btn"
                            onClick={() => navigate(-1)}
                        >
                            Quay lại
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default PartnerCarDetailPage;
