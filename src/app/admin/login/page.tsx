"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLandingPath } from "@/lib/admin-target";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      // Phones get the artist mode on the home page, not the desktop portal.
      router.push(adminLandingPath());
      router.refresh();
    } else {
      setError("Mot de passe incorrect. Réessayez.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f9f6f1] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-10">
        {/* Logo / Name */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-[#2c2c2c] mb-1">Manon Sauvé</h1>
          <p className="text-sm text-[#9b8b7c] tracking-widest uppercase">Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#5c5c5c] mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#e0d9d0] rounded-lg px-4 py-3 text-lg text-[#2c2c2c] focus:outline-none focus:ring-2 focus:ring-[#9b8b7c] bg-[#fdfbf8]"
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2c2c2c] text-white py-3 rounded-lg text-base font-medium hover:bg-[#444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs text-[#bbb] mt-8">
          Contactez Alexandre pour le mot de passe
        </p>
      </div>
    </div>
  );
}
