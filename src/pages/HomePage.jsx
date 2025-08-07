import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/HomePage.css";


function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="home-root">
      <Header />
      <main className="home-main">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-hero-img">
            <img src="/hero.png" alt="" className="home-hero-banner" />
            <div className="home-hero-text">
              <h1>ChevMaz - Cùng Bạn Đến Mọi Hành Trình</h1>
            </div>
          </div>
        </section>

        {/* Car List Section
        <section className="home-section">
          <h2 className="home-section-title">Xe dành cho bạn</h2>
          <div className="home-cars-list">
            {[...Array(6)].map((_, i) => (
              <div className="home-car-card" key={i}>
                <img src="/assets/car.jpg" alt="Toyota" className="home-car-img" />
                <div className="home-car-info">
                  <div className="home-car-title">Toyota</div>
                  <div className="home-car-desc">5 chỗ | Tự động | 4.2/5</div>
                  <div className="home-car-location">Quận 1, Đường Nguyễn Thị Định, HCM</div>
                  <div className="home-car-price">749k/ngày</div>
                </div>
              </div>
            ))}
          </div>
        </section> */}

        {/* Features Section
        <section className="home-section">
          <h2 className="home-section-title">Ưu điểm của ChevMaz</h2>
          <p className="home-section-desc">
            Những tính năng giúp bạn dễ dàng hơn khi thuê xe trên ChevMaz.
          </p>
          <div className="home-features-list">
            {[1, 2, 3, 4].map((n) => (
              <div className="home-feature-card" key={n}>
                <img src={`/assets/feature${n}.svg`} alt="Feature" className="home-feature-img" />
                <div className="home-feature-desc">
                  Những tính năng giúp bạn dễ dàng hơn khi thuê xe trên ChevMaz.
                </div>
              </div>
            ))}
          </div>
        </section> */}

        {/* Services Section */}
        <section className="home-section">
          <h2 className="home-section-title">Dịch vụ của ChevMaz</h2>
          <div className="home-service-banner">
            <img src="/service.png" alt="Service" className="home-service-img" />
            <div className="home-service-text">
              <h3>Xe đã sẵn sàng. Bắt đầu hành trình ngay!</h3>
              <p>Tự tay cầm lái chiếc xe bạn yêu thích cho hành trình thêm hứng khởi.</p>
              <button className="home-service-btn" onClick={() => navigate("/cars")}>
                Thuê xe tự lái
              </button>
            </div>
          </div>
        </section>

        {/* Become a Partner Section */}
        <section className="home-section home-partner-section">
          <div className="home-partner-card">
            <div className="home-partner-info">
              <div className="home-partner-icon">🚕</div>
              <h3>Bạn muốn cho thuê xe?</h3>
              <p>
                Đăng ký trở thành đối tác của chúng tôi ngay hôm nay để gia tăng thu nhập hàng tháng.
              </p>
              <div className="home-partner-actions">
                <button className="home-partner-btn">Tìm hiểu ngay</button>
                <button className="home-partner-btn primary" onClick={() => navigate("/register-car")}>
                  Đăng ký cho thuê
                </button>
              </div>
            </div>
            <img src="/partner.png" alt="Partner" className="home-partner-img" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;