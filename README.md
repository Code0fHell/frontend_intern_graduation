# Hướng dẫn cài đặt

1. **Yêu cầu môi trường**

    - Node.js >= 16
    - npm hoặc yarn

2. **Cài đặt dependencies**

    ```sh
    npm install
    ```

3. **Chạy frontend**

    ```sh
    npm run dev
    ```

    Truy cập tại `http://localhost:5173`

4. **Chạy backend**
    - Đảm bảo backend Java Spring Boot đã chạy tại `http://localhost:8080`

---

# Danh sách API được gọi theo từng page

## Đăng nhập/Đăng ký ([src/components/Auth/LoginForm.jsx](src/components/Auth/LoginForm.jsx), [src/components/Auth/SignUpForm.jsx](src/components/Auth/SignUpForm.jsx))

-   Đăng nhập: `POST /api/auth/login`
-   Đăng ký: `POST /api/auth/register`
-   Lấy danh sách tỉnh/huyện/xã: `https://provinces.open-api.vn/api/p/`, `.../api/p/{tinh}?depth=2`, `.../api/d/{quan}?depth=2`

## Danh sách xe ([src/pages/CarListPage.jsx](src/pages/CarListPage.jsx))

-   Lấy tỉnh: `https://provinces.open-api.vn/api/p/`
-   Lấy hãng xe: `GET /api/renting/hang-xe`
-   Lấy mẫu xe: `GET /mau-xe/hang-xe-{hangXe}`
-   Lấy tất cả xe: `GET /api/renting/get-all-cars`
-   Lấy ảnh xe: `GET /api/renting/cars/{carId}/images/thumnail`
-   Tìm kiếm xe: `POST /api/renting/search-cars`

## Chi tiết xe ([src/pages/CarDetailPage.jsx](src/pages/CarDetailPage.jsx))

-   Lấy ảnh xe: `GET /api/renting/cars/{id}/images/thumnail`
-   Lấy tiện nghi xe: `GET /api/renting/cars/{id}/tien-nghi`
-   Lấy đánh giá xe: `GET /api/renting/cars/{id}/reviews`
-   Đặt thuê xe: `POST /api/hop-dong-thue`

## Đăng ký xe ([src/pages/CarRegisterPage.jsx](src/pages/CarRegisterPage.jsx), [src/components/CarRegisterForm.jsx](src/components/CarRegisterForm.jsx))

-   Lấy hãng xe: `GET /hang-xe`
-   Lấy mẫu xe: `GET /mau-xe/hang-xe-{hangXe}`
-   Lấy tỉnh/huyện/xã: `https://provinces.open-api.vn/api/p/`, `.../api/p/{tinh}?depth=2`, `.../api/d/{quan}?depth=2`
-   Tạo xe: `POST /cars`

## Quản lý xe (Admin) ([src/pages/AdminCarListPage.jsx](src/pages/AdminCarListPage.jsx))

-   Lấy xe chờ duyệt: `GET /cars/cho-duyet`
-   Lấy xe hoạt động: `GET /api/renting/get-all-cars`
-   Lấy tiện nghi xe: `GET /api/renting/cars/{carId}/tien-nghi`
-   Lấy hợp đồng cho thuê: `GET /hop-dong-cho-thue/all`
-   Phê duyệt xe: `PUT /cars/{carId}`

## Quản lý hợp đồng thuê xe (Admin) ([src/pages/AdminRentalContractsPage.jsx](src/pages/AdminRentalContractsPage.jsx))

-   Lấy hợp đồng thuê: `GET /api/hop-dong-thue`
-   Thêm khách hàng vào danh sách đen: `POST /api/danh-sach-den/create`

## Danh sách đen ([src/pages/BlackListPage.jsx](src/pages/BlackListPage.jsx))

-   Lấy danh sách đen: `GET /api/danh-sach-den/all`
-   Cập nhật trạng thái: `PUT /api/danh-sach-den/update`

## Đối tác ([src/pages/PartnerCarPage.jsx](src/pages/PartnerCarPage.jsx), [src/pages/PartnerCarDetailPage.jsx](src/pages/PartnerCarDetailPage.jsx))

-   Lấy xe của đối tác: `GET /cars/doi-tac/{userId}`
-   Lấy ảnh xe: `GET /api/renting/cars/{carId}/images/all`
-   Lấy tiện nghi xe: `GET /api/renting/cars/{carId}/tien-nghi`

## Hợp đồng cho thuê với đối tác ([src/pages/ContractPartnerPage.jsx](src/pages/ContractPartnerPage.jsx), [src/pages/ContractPartnerDetailPage.jsx](src/pages/ContractPartnerDetailPage.jsx))

-   Lấy hợp đồng cho thuê: `GET /hop-dong-cho-thue/all`
-   Hủy hợp đồng: `PUT /hop-dong-cho-thue/huy/{id}`
-   Thanh lý hợp đồng: `PUT /hop-dong-cho-thue/thanh-ly/{id}`

## Hợp đồng thuê xe ([src/pages/ContractDetailPage.jsx](src/pages/ContractDetailPage.jsx))

-   Lấy hợp đồng thuê: `GET /api/hop-dong-thue/{id}`
-   Phê duyệt hợp đồng: `PUT /api/hop-dong-thue/confirm/{id}`
-   Hủy hợp đồng: `PUT /api/hop-dong-thue/cancel/{id}`
-   Thanh lý hợp đồng: `PUT /api/hop-dong-thue/thanh-ly/{id}`
-   Cập nhật ngày bắt đầu/kết thúc: `PUT /api/hop-dong-thue/checkin/{id}`, `PUT /api/hop-dong-thue/checkout/{id}`
-   Quản lý tài sản cầm cố: `POST /api/tai-san-cam-co/nhan`, `PUT /api/tai-san-cam-co/tra`
-   Thêm khách hàng vào danh sách đen: `POST /api/danh-sach-den/create`

## Tạo hóa đơn ([src/pages/CreateInvoicePage.jsx](src/pages/CreateInvoicePage.jsx))

-   Tạo hóa đơn: `POST /api/hoa-don`
-   Lấy tổng tiền: `GET /api/hoa-don/tong-tien`

## Tạo hóa đơn đối tác ([src/pages/CreatePartnerInvoicePage.jsx](src/pages/CreatePartnerInvoicePage.jsx))

-   Lấy tổng tiền: `GET /api/hoa-don/tong-tien`
-   Tạo hóa đơn đối tác: `POST /hoa-don-doi-tac`

## Danh sách hóa đơn ([src/pages/InvoiceListPage.jsx](src/pages/InvoiceListPage.jsx))

-   Lấy hóa đơn khách hàng: `GET /api/hoa-don/all`
-   Lấy hóa đơn đối tác: `GET /hoa-don-doi-tac/all`

---

**Lưu ý:**

-   Các API có tiền tố `/api/` là của backend Spring Boot.
-   Đảm bảo backend đã chạy đúng port và các endpoint khớp với cấu hình trong file [`vite.config.js`](vite.config.js)
