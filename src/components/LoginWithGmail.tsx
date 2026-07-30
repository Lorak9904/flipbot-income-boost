import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  CHECKOUT_CURRENCY_STORAGE_KEY,
  normalizeBillingCurrency,
} from "@/lib/billing-pricing";
import { getCurrentLanguage, getLocalizedPathForLanguage } from "./language-utils";
import {
  AuthApiError,
  buildGoogleLoginPayload,
  getAuthErrorCode,
} from '@/lib/legal-acceptance';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: "easeOut" },
  }),
};

type LoginWithGmailProps = {
  signupMode?: boolean;
  legalAccepted?: boolean;
  onAuthError?: (error: unknown) => void;
};

export default function LoginWithGmail({
  signupMode = false,
  legalAccepted = false,
  onAuthError,
}: LoginWithGmailProps) {
  const { setUserAndTokens } = useAuth();
  const navigate = useNavigate();

  if (signupMode && !legalAccepted) {
    return (
      <motion.div variants={fadeUp} custom={6} className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          disabled
          className="h-10 w-full max-w-[370px] cursor-not-allowed rounded-full border border-neutral-600 bg-neutral-800 text-sm font-medium text-neutral-500"
        >
          {getCurrentLanguage() === 'pl' ? 'Kontynuuj z Google' : 'Continue with Google'}
        </button>
      </motion.div>
    );
  }

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
            const response = await axios.post(
              `/api/auth/login/google`,
              buildGoogleLoginPayload(credential, signupMode),
            );

            const { token, refresh_token, userData } = response.data;
            setUserAndTokens(userData, token, refresh_token);
            const checkoutPlan = sessionStorage.getItem('flipit_checkout_plan');
            const checkoutBilling = sessionStorage.getItem('flipit_checkout_billing') || 'monthly';
            const checkoutCurrency = normalizeBillingCurrency(
              sessionStorage.getItem(CHECKOUT_CURRENCY_STORAGE_KEY)
            ) || 'pln';
            if (checkoutPlan) {
              navigate(
                getLocalizedPathForLanguage(
                  `/pricing?checkout=1&plan=${checkoutPlan}&billing=${checkoutBilling}&currency=${checkoutCurrency}`,
                  getCurrentLanguage(),
                ),
              );
            } else {
              navigate(getLocalizedPathForLanguage('/', getCurrentLanguage()));
            }
            window.location.reload();
          } catch (err) {
            const payload = axios.isAxiosError(err) ? err.response?.data : null;
            const code = getAuthErrorCode(payload);
            onAuthError?.(new AuthApiError(code || 'google_login_failed'));
          }
        }}
        onError={() => onAuthError?.(new AuthApiError('google_login_failed'))}
      />
    </motion.div>
  );
}
