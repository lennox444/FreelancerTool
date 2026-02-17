'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/authStore';
import { Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, accessToken, refreshToken } = await authApi.register(formData);
      setAuth(user, accessToken, refreshToken);
      router.push('/onboarding/step1'); // Redirect to onboarding
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google Login logic here
    console.log("Google Login clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden isolate">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 w-full h-full opacity-40">
          <PixelBlast
            variant="square"
            pixelSize={6}
            color="#800040"
            patternScale={4}
            patternDensity={0.5}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            speed={0.2}
            transparent
          />
        </div>
        {/* Soft Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)] pointer-events-none" />
      </div>

      <SpotlightCard
        className="w-full max-w-lg mx-4 p-8 md:p-10 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100"
        spotlightColor="rgba(128, 0, 64, 0.15)"
      >
        <div className="flex flex-col items-center mb-8 relative z-10">
          {/* Logo */}
          <Link href="/" className="mb-6 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="FreelanceFlow Logo"
                width={180}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
          </Link>

          <h2 className="text-3xl font-bold text-slate-900 tracking-tight text-center">Konto erstellen</h2>
          <p className="mt-2 text-center text-slate-500 font-medium">
            Starte kostenlos mit FreelanceFlow
          </p>
        </div>

        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                Vorname
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all duration-200 ease-in-out sm:text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                Nachname
              </label>
              <div className="relative group">
                {/* No icon for last name to save space or reuse User? Let's reuse User for consistent look or none. Actually for consistency let's add no icon or use User again? User icon fits both. Let's use User icon for both. */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all duration-200 ease-in-out sm:text-sm"
                  placeholder="Mustermann"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
              E-Mail Adresse
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all duration-200 ease-in-out sm:text-sm"
                placeholder="max@beispiel.de"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
              Passwort
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-11 pr-10 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all duration-200 ease-in-out sm:text-sm"
                placeholder="Mindestens 8 Zeichen"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <StarBorder as="button" className="w-full rounded-xl group" color="#d946ef" speed="4s" type="submit" disabled={loading}>
              <div className="w-full h-12 bg-[#800040] hover:bg-[#600030] text-white flex items-center justify-center rounded-xl transition-all font-semibold text-base shadow-lg shadow-pink-900/20">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Konto wird erstellt...
                  </>
                ) : (
                  <>
                    Jetzt registrieren <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </StarBorder>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/95 text-slate-500 font-medium">Oder registrieren mit</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 relative group overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="relative z-10">Google</span>
          </button>

          <p className="text-center text-sm text-slate-500 mt-8">
            Bereits registriert?{' '}
            <Link href="/login" className="font-semibold text-[#800040] hover:text-[#600030] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-[#800040] after:transition-all after:duration-300">
              Zum Login
            </Link>
          </p>
        </form>
      </SpotlightCard>

      {/* Footer minimal */}
      <div className="absolute bottom-6 text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} FreelanceFlow
      </div>
    </div>
  );
}
