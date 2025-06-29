import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: "easeOut" },
  }),
};

export default function LoginWithGmail() {
  const { setUserAndTokens } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeUp} custom={6} className="mt-6 flex flex-col items-center gap-3">
      <GoogleLogin
        theme="filled_black"
        size="large"
        text="continue_with"
        shape="pill"
        logo_alignment="center"
        width="370"
        onSuccess={async (credentialResponse) => {
          const credential = credentialResponse.credential;
          // console.log(jwtDecode(credentialResponse.credential));
          if (!credential) return;

          try {
            const response = await axios.post(`/api/auth/login/google`, {
              credential,
            });

            const { token, refresh_token, userData } = response.data;
            setUserAndTokens(userData, token, refresh_token);
            navigate("/");
            window.location.reload();
          } catch (err) {
            console.error("Google login error", err);
          }
        }}
        onError={() => console.log("Google login failed")}
      />
    </motion.div>
  );
}
