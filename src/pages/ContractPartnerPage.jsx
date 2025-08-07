import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/ContractPartnerPage.css";

function ContractPartnerPage() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user?.id) return;
        axios
            .get("http://localhost:8080/hop-dong-cho-thue/all")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                // Lọc hợp đồng của đối tác hiện tại
                const partnerContracts = data.filter(
                    (c) => c.oto?.doiTac?.id === user.id
                );
                setContracts(partnerContracts);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user?.id]);

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="contract-partner-root">
            <Header />
            <div className="contract-partner-list-container">
                <h2>Danh sách hợp đồng cho thuê của bạn</h2>
                <table className="contract-partner-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Xe</th>
                            <th>Biển số</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Giá thuê</th>
                            <th>Nhân viên ký</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map((contract, idx) => (
                            <tr key={contract.id}>
                                <td>{idx + 1}</td>
                                <td>
                                    {contract.oto?.mauXe?.hangXe?.ten}{" "}
                                    {contract.oto?.mauXe?.ten}
                                </td>
                                <td>{contract.oto?.bienSo || "Không rõ"}</td>
                                <td>
                                    {contract.ngayBatDau
                                        ? new Date(
                                              contract.ngayBatDau
                                          ).toLocaleDateString()
                                        : ""}
                                </td>
                                <td>
                                    {contract.ngayKetThuc
                                        ? new Date(
                                              contract.ngayKetThuc
                                          ).toLocaleDateString()
                                        : ""}
                                </td>
                                <td>
                                    {contract.giaThue
                                        ? contract.giaThue.toLocaleString()
                                        : ""}
                                </td>
                                <td>{contract.nhanVien?.hoTen || ""}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {contracts.length === 0 && (
                    <div style={{ marginTop: 24 }}>Không có hợp đồng nào.</div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default ContractPartnerPage;
