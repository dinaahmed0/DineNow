import { FiSmartphone, FiCheckCircle, FiCode } from 'react-icons/fi';
import applelogo from '../../assets/applestore.png';
import googlelogo from '../../assets/googleplay.png';

export default function MobileAppBanner() {

  return (
    <>
      {/* Floating Banner - Shows after scroll */}
      {/* {scrolled && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-4 w-[calc(100vw-2rem)] max-w-lg border border-gray-700 backdrop-blur-sm bg-opacity-95">
            <div className="flex items-center gap-3">
              
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <img src={logo} alt="App Logo" className="w-12 h-12" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">Get the App</h4>
                <p className="text-gray-400 text-xs">Book faster & get exclusive deals</p>
                <div className="flex items-center gap-1 mt-1">
                  <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-400 text-xs ml-1">4.9</span>
                </div>
              </div>
              
              <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition shadow-lg">
                Download
              </button>
              
              {isDismissible && (
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-300">
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )} */}

      {/* Main Banner - Hero Style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 rounded-3xl shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -right-32 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-32 w-64 h-64 bg-emerald-600 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -right-32 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-32 w-64 h-64 bg-emerald-600 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative px-6 py-10 md:py-12 md:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6 border border-white/20">
                <FiSmartphone className="w-3 h-3 text-emerald-300" />
                <span className="text-xs font-medium text-emerald-300 uppercase tracking-wider">
                  Mobile App
                </span>
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Free
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Reserve Your Table
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  On The Go
                </span>
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-base md:text-lg mb-6 max-w-lg mx-auto lg:mx-0">
                Download our app for instant bookings, exclusive offers, and rewards with every reservation.
              </p>

              {/* Feature List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-lg mx-auto lg:mx-0">
                {[
                  "Instant confirmation",
                  "Exclusive member deals",
                  "Easy cancellation",
                  "Loyalty rewards",
                  "Real-time availability",
                  "Favorite spots"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button className="group relative inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-xl px-5 py-3 transition-all duration-300">
                  <img src={applelogo} alt="Apple Store" className="w-8 h-8" />
                  <div className="text-left">
                    <p className="text-gray-400 text-xs">Download on the</p>
                    <p className="text-white font-semibold text-sm">App Store</p>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition"></div>
                </button>
                
                <button className="group relative inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-xl px-5 py-3 transition-all duration-300">
                  <img src={googlelogo} alt="Google Play" className="w-8 h-8" />
                  <div className="text-left">
                    <p className="text-gray-400 text-xs">Get it on</p>
                    <p className="text-white font-semibold text-sm">Google Play</p>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition"></div>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mt-6">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-sm">★★★★★</span>
                  <span className="text-gray-400 text-xs">4.9 (12k+ reviews)</span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 text-sm">✓</span>
                  <span className="text-gray-400 text-xs">#1 Dining App</span>
                </div>
              </div>
            </div>

            {/* Right Content - Phone Mockup + QR */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Mockup */}
                <div className="relative w-64 md:w-72 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
                  {/* Phone Screen */}
                  <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 p-3">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-2 pt-2 pb-3">
                      <span className="text-white text-xs">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* App Preview */}
                    <div className="space-y-3">
                      {/* Restaurant Card Mock */}
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-white/20 rounded w-3/4 mb-2"></div>
                            <div className="h-2 bg-white/10 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Booking Mock */}
                      <div className="bg-emerald-500/20 rounded-xl p-3 border border-emerald-500/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="h-3 bg-emerald-400/50 rounded w-20 mb-2"></div>
                            <div className="h-2 bg-emerald-400/30 rounded w-32"></div>
                          </div>
                          <div className="w-8 h-8 bg-emerald-500 rounded-lg"></div>
                        </div>
                      </div>
                      
                      {/* Bottom Nav Mock */}
                      <div className="flex justify-around pt-3">
                        <div className="w-6 h-6 bg-white/20 rounded"></div>
                        <div className="w-6 h-6 bg-emerald-400 rounded"></div>
                        <div className="w-6 h-6 bg-white/20 rounded"></div>
                        <div className="w-6 h-6 bg-white/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl"></div>
                </div>

                {/* QR Code Float */}
                <div className="absolute -bottom-4 -right-4 md:-right-6 bg-white rounded-xl p-2 shadow-xl animate-bounce-slow">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                    <FiCode className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-emerald-500 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-emerald-400 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Dismiss Button (if dismissible) */}
          {/* {isDismissible && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          )} */}
        </div>

        {/* Bottom Gradient Bar */}
        {/* <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div> */}
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}