// import { useState } from "react";
import LoginForm from "../components/Auth/LoginForm.jsx";

function LoginPage() {

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f9f9fb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <LoginForm />
    </div>
  );
}

export default LoginPage;