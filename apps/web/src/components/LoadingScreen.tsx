import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Start exit animation
          setTimeout(() => {
            setIsExiting(true);
            // Complete loading after exit animation
            setTimeout(onLoadingComplete, 800);
          }, 300);
          return 100;
        }
        // Random progress increments for more natural feel
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(progressInterval);
  }, [onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-pink-200/30 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-purple-200/30 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-t from-pink-200/30 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo container with pulse animation */}
        <div className="relative mb-8">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse-slow" />

          {/* Logo */}
          <div className="relative bg-white rounded-full p-8 shadow-2xl transform transition-transform hover:scale-105">
            <img
              src="/logo.png"
              alt="Eliana Beauty"
              className="w-24 h-24 object-contain animate-float"
            />
          </div>

          {/* Rotating ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-pink-400 border-r-purple-400 rounded-full animate-spin-slow" />
        </div>

        {/* Brand name */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-fade-in">
          Eliana Beauty
        </h1>

        <p className="text-gray-500 text-sm mb-8 animate-fade-in animation-delay-300">
          Reveal Your Beauty
        </p>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden animate-fade-in animation-delay-500">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-[length:200%_100%] animate-shimmer transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress percentage */}
        <div className="mt-4 text-sm font-medium text-gray-600 animate-fade-in animation-delay-700">
          {Math.round(progress)}%
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-6 animate-fade-in animation-delay-1000">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animation-delay-700 {
          animation-delay: 700ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
