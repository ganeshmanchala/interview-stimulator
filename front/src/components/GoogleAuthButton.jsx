// src/components/GoogleAuthButton.jsx
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { handleGoogleCredential } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

export default function GoogleAuthButton({ onSuccess, onError }) {
  const { login } = useAuth();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const data = await handleGoogleCredential(credentialResponse);
          
          // ✅ Update global React auth state
          if (data.user && data.token) {
            login(data.user, data.token);
          }

          if (onSuccess) onSuccess(data);
        } catch (err) {
          console.error("Google login error:", err);
          if (onError) onError(err);
        }
      }}
      onError={(err) => {
        console.error("Google login failure", err);
        if (onError) onError(err);
      }}
      useOneTap={false}
    />
  );
}
