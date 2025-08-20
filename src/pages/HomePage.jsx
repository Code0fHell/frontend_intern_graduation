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
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;