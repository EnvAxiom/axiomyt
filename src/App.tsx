import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  Music, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  Zap, 
  ShieldCheck, 
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils/cn';

type Format = 'mp3' | 'mp4';
type Quality = '360p' | '480p' | '720p' | '1080p' | '4K';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
}

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<Format>('mp4');
  const [quality, setQuality] = useState<Quality>('1080p');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const validateUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(url);
  };

  const handleConvert = () => {
    if (!validateUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setIsFinished(false);
    setProgress(0);

    // Mock video info fetch
    setVideoInfo({
      title: 'Amazing Nature 4K - Ultra HD Relaxation',
      thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
      duration: '10:05',
      author: 'Nature Bliss'
    });

    // Simulated progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsFinished(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const reset = () => {
    setUrl('');
    setVideoInfo(null);
    setIsFinished(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-red-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <Play className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight">TubeConvert</span>
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Converter</a>
              <a href="#" className="hover:text-white transition-colors">How it works</a>
              <a href="#" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Servers Live</span>
              </div>
              <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/10">
                Support Us
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto pt-16 pb-24 px-4 sm:px-6">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent"
          >
            Download YouTube Videos <br /> Fast & Free
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto"
          >
            Convert YouTube videos to MP3 or MP4 in high quality. Simple, fast, and no registration required.
          </motion.p>
        </div>

        {/* Converter Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600"></div>
          
          <div className="space-y-6">
            {/* Input Area */}
            <div className="relative">
              <input
                type="text"
                placeholder="Paste YouTube link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-gray-600"
              />
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="absolute right-2 top-2 bottom-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Convert</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Format</label>
                <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setFormat('mp4')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                      format === 'mp4' ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    <Video className="w-4 h-4" />
                    MP4 (Video)
                  </button>
                  <button
                    onClick={() => setFormat('mp3')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                      format === 'mp3' ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    <Music className="w-4 h-4" />
                    MP3 (Audio)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Quality</label>
                <div className="relative">
                  <select
                    disabled={format === 'mp3'}
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as Quality)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 px-4 text-sm font-semibold focus:outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="4K">4K UHD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="480p">480p</option>
                    <option value="360p">360p</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Progress / Result Area */}
            <AnimatePresence mode="wait">
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-6 border-t border-white/5"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        {videoInfo && (
                          <img src={videoInfo.thumbnail} className="w-16 h-10 object-cover rounded shadow" alt="Thumbnail" />
                        )}
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{videoInfo?.title}</p>
                          <p className="text-xs text-gray-500">Processing your file...</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-red-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-red-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {isFinished && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-6 border-t border-white/5"
                >
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <img src={videoInfo?.thumbnail} className="w-40 h-24 object-cover rounded-xl shadow-lg" alt="Thumbnail" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <CheckCircle2 className="text-white w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-lg mb-1 truncate max-w-[300px]">{videoInfo?.title}</h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4 text-xs text-gray-400">
                        <span className="bg-white/5 px-2 py-1 rounded">Format: {format.toUpperCase()}</span>
                        {format === 'mp4' && <span className="bg-white/5 px-2 py-1 rounded">Quality: {quality}</span>}
                        <span className="bg-white/5 px-2 py-1 rounded">Duration: {videoInfo?.duration}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-white text-black hover:bg-gray-200 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Download Now
                        </button>
                        <button 
                          onClick={reset}
                          className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all"
                          title="Convert another"
                        >
                          <Zap className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="Lightning Fast"
            description="Our servers process your videos in seconds, giving you high-speed downloads without the wait."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-green-400" />}
            title="Safe & Secure"
            description="No viruses, no malware. We prioritize your privacy and data security above everything else."
          />
          <FeatureCard 
            icon={<Smartphone className="w-6 h-6 text-blue-400" />}
            title="All Devices"
            description="Works perfectly on iPhone, Android, PC, and Mac. Simply open your browser and convert."
          />
        </div>

        {/* SEO Content / FAQ */}
        <section className="mt-24 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about our YouTube converter.</p>
          </div>
          
          <div className="grid gap-4">
            <FaqItem 
              question="Is this service free to use?"
              answer="Yes, TubeConvert is 100% free to use. There are no hidden costs, subscriptions, or limits on the number of conversions you can perform."
            />
            <FaqItem 
              question="Can I convert to 4K quality?"
              answer="Absolutely! If the source YouTube video is available in 4K, our converter allows you to select and download it in full 4K UHD quality."
            />
            <FaqItem 
              question="Do I need to install any software?"
              answer="No software installation is required. Everything happens directly in your web browser, whether you are on a computer or a mobile device."
            />
            <FaqItem 
              question="How long can the videos be?"
              answer="We support videos up to 2 hours in length for MP4 conversion and up to 4 hours for MP3 conversion to ensure stable processing."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-red-600/20 p-1.5 rounded-lg border border-red-600/20">
                <Play className="w-5 h-5 text-red-500 fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight">TubeConvert</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 TubeConvert. All rights reserved.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
            TubeConvert does not host any content. All videos and audios are served from YouTube's CDN. We encourage users to respect copyright laws and only download content for personal use or when permitted by the copyright holder.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl"
  >
    <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold">{question}</span>
        <ChevronDown className={cn("w-5 h-5 text-gray-500 transition-transform", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
