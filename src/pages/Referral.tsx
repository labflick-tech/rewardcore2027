import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Referral = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Store referral code in sessionStorage
    if (code) {
      sessionStorage.setItem("referral_code", code);
    }
    // Redirect to signup
    navigate("/auth?mode=signup");
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">Redirecting...</div>
    </div>
  );
};

export default Referral;
