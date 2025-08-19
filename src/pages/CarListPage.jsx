import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import "../assets/css/CarListPage.css";

function CarListPage() {
    const navigate = useNavigate();

    const [cars, setCars] = useState([]);
    const [hangXeList, setHangXeList] = useState([]);
    const [mauXeList, setMauXeList] = useState([]);
    const [tinhList, setTinhList] = useState([]);
    const [carImages, setCarImages] = useState({});
    const [filters, setFilters] = useState({
        hangXe: "",
        mauXe: "",
        truyenDong: "",
        soGhe: "",
        nhienLieu: "",
        tinh: "",
        pickupDateTime: "",
        returnDateTime: "",
    });
    console.log("cars: " + JSON.stringify(cars));

    // Lấy danh sách tỉnh từ API open-api.vn
    useEffect(() => {
        axios
            .get("https://provinces.open-api.vn/api/p/")
            .then((res) => setTinhList(res.data.map((t) => t.name)))
            .catch(() => setTinhList([]));
    }, []);

    // Lấy danh sách hãng xe khi load trang
    useEffect(() => {
        axios
            .get("http://localhost:8080/api/renting/hang-xe")
            .then((res) => setHangXeList(res.data))
            .catch(() => setHangXeList([]));
    }, []);

    // Lấy danh sách mẫu xe khi chọn hãng xe
    useEffect(() => {
        if (filters.hangXe) {
            axios
                .get(`http://localhost:8080/mau-xe/hang-xe-${filters.hangXe}`)
                .then((res) => setMauXeList(res.data))
                .catch(() => setMauXeList([]));
        } else {
            setMauXeList([]);
        }
    }, [filters.hangXe]);

    // Lấy tất cả xe đang hoạt động khi load trang
    useEffect(() => {
        axios
            .get("http://localhost:8080/api/renting/get-all-cars")
            .then(async (res) => {
                setCars(res.data);

                // Lấy ảnh cho từng xe
                const imagePromises = res.data.map((car) =>
                    axios
                        .get(
                            `http://localhost:8080/api/renting/cars/${car.id}/images/thumnail`
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
    }, []);

    // Xử lý thay đổi bộ lọc
    function handleFilterChange(e) {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    }

    // Gọi API tìm xe
    async function handleSearch() {
        // Ràng buộc bắt buộc phải chọn thời gian nhận và trả xe
        if (!filters.pickupDateTime || !filters.returnDateTime) {
            alert("Vui lòng chọn thời gian nhận và thời gian trả xe!");
            return;
        }
        const selectedHangXe = hangXeList.find(
            (hx) => hx.id.toString() === filters.hangXe
        );
        const brandName = selectedHangXe ? selectedHangXe.ten : "";
        const payload = {
            brand: brandName,
            transmissionType: filters.truyenDong,
            fuelType: filters.nhienLieu,
            seats: filters.soGhe,
            tinh: filters.tinh,
            thoiGianNhan: new Date(filters.pickupDateTime)
                .toISOString()
                .replace("T", " ")
                .slice(0, 19),
            thoiGianTra: new Date(filters.returnDateTime)
                .toISOString()
                .replace("T", " ")
                .slice(0, 19),
        };
        console.log("payload: " + JSON.stringify(payload));
        try {
            const res = await axios.post(
                "http://localhost:8080/api/renting/search-cars",
                payload
            );
            setCars(res.data);

            // Lấy danh sách tên file ảnh cho từng xe
            const imagePromises = res.data.map((car) =>
                axios
                    .get(
                        `http://localhost:8080/api/renting/cars/${car.id}/images/thumnail`
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
        } catch {
            setCars([]);
            setCarImages({});
        }
    }

    return (
        <div className="carlist-root">
            <Header />
            <main className="carlist-main">
                <div className="carlist-filters">
                    <div>
                        <label>Hãng xe</label>
                        <select
                            name="hangXe"
                            value={filters.hangXe}
                            onChange={handleFilterChange}
                        >
                            <option value="">Chọn hãng xe</option>
                            {hangXeList.map((hx) => (
                                <option key={hx.id} value={hx.id}>
                                    {hx.ten}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Mẫu xe</label>
                        <select
                            name="mauXe"
                            value={filters.mauXe}
                            onChange={handleFilterChange}
                            disabled={!filters.hangXe}
                        >
                            <option value="">Chọn mẫu xe</option>
                            {mauXeList.map((mx) => (
                                <option key={mx.id} value={mx.id}>
                                    {mx.tenMauXe}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Truyền động</label>
                        <select
                            name="truyenDong"
                            value={filters.truyenDong}
                            onChange={handleFilterChange}
                        >
                            <option value="">Chọn truyền động</option>
                            <option value="Số tự động">Số tự động</option>
                            <option value="Số sàn">Số sàn</option>
                        </select>
                    </div>
                    <div>
                        <label>Số ghế</label>
                        <select
                            name="soGhe"
                            value={filters.soGhe}
                            onChange={handleFilterChange}
                        >
                            <option value="">Chọn số ghế</option>
                            {[...Array(10)].map((_, i) => {
                                const seat = i + 4;
                                return (
                                    <option key={seat} value={seat}>
                                        {seat}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label>Nhiên liệu</label>
                        <select
                            name="nhienLieu"
                            value={filters.nhienLieu}
                            onChange={handleFilterChange}
                        >
                            <option value="">Chọn nhiên liệu</option>
                            <option value="Xăng">Xăng</option>
                            <option value="Điện">Điện</option>
                        </select>
                    </div>
                    <div>
                        <label>Tỉnh</label>
                        <select
                            name="tinh"
                            value={filters.tinh}
                            onChange={handleFilterChange}
                        >
                            <option value="">Chọn tỉnh</option>
                            {tinhList.map((tinh) => (
                                <option key={tinh} value={tinh}>
                                    {tinh}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Thời gian nhận xe</label>
                        <input
                            type="datetime-local"
                            name="pickupDateTime"
                            value={filters.pickupDateTime}
                            onChange={handleFilterChange}
                            placeholder="Thời gian nhận"
                        />
                    </div>
                    <div>
                        <label>Thời gian trả xe</label>
                        <input
                            type="datetime-local"
                            name="returnDateTime"
                            value={filters.returnDateTime}
                            onChange={handleFilterChange}
                            placeholder="Thời gian trả"
                        />
                    </div>
                    <button onClick={handleSearch}>Tìm xe</button>
                </div>
                <div className="carlist-list">
                    {cars.map((car) => (
                        <div
                            className="carlist-card"
                            key={car.id}
                            onClick={() =>
                                navigate(`/cars/${car.id}`, {
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
                                        },
                                    },
                                })
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <img
                                src={
                                    carImages[car.id]?.[0]
                                        ? carImages[car.id][0]
                                        : "/default-car.png"
                                }
                                alt={car.ten}
                                className="carlist-img"
                            />
                            <div className="carlist-info">
                                <div className="carlist-title">
                                    {car?.mauXe?.hangXe?.ten +
                                        " " +
                                        car?.mauXe?.ten}
                                </div>
                                <div className="carlist-desc">
                                    {car?.mauXe?.soGhe} chỗ | {car.truyenDong} |{" "}
                                    {car?.loaiNhienLieu} |{" "}
                                    {car?.mucTieuThu + "L/100km"}
                                </div>
                                <div className="carlist-location">
                                    {car?.diaChi.soNha}, {car?.diaChi.phuong},{" "}
                                    {car?.diaChi.quan}, {car?.diaChi.tinh}
                                </div>
                                <div className="carlist-price">
                                    {car.gia?.toLocaleString()}đ/ngày
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CarListPage;
