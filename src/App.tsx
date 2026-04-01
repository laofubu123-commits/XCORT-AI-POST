import React, { useState } from 'react';
import { 
  Wrench, 
  Facebook, 
  FileText, 
  Image as ImageIcon, 
  Copy, 
  RefreshCw, 
  Zap, 
  CheckCircle2,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductData, GeneratedContent } from './types';
import { generateMarketingContent } from './services/geminiService';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductData>({
    name: '',
    modelNumber: '',
    voltage: '',
    power: '',
    features: '',
    application: ''
  });
  const [results, setResults] = useState<GeneratedContent | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (persuasive = false) => {
    if (!product.name || !product.modelNumber || !product.features) {
      alert('Please fill in the required fields (Name, Model Number, Features)');
      return;
    }

    setLoading(true);
    try {
      const content = await generateMarketingContent(product, persuasive);
      setResults(content);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-orange-200">
      {/* Header */}
      <header className="bg-[#1A1A1A] text-white py-6 px-4 md:px-8 border-b-4 border-orange-500 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-sm">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">XCORT AI</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold">Marketing Tool v1.0</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Industrial Grade Content Generation</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2 border-b-2 border-[#1A1A1A] pb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Product Parameters
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1">Product Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Brushless Impact Drill"
                  className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1">Product Model Number *</label>
                <input 
                  type="text" 
                  name="modelNumber"
                  value={product.modelNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. XC-8120"
                  className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1">Voltage</label>
                  <input 
                    type="text" 
                    name="voltage"
                    value={product.voltage}
                    onChange={handleInputChange}
                    placeholder="e.g. 20V or Gasoline"
                    className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1">Power</label>
                  <input 
                    type="text" 
                    name="power"
                    value={product.power}
                    onChange={handleInputChange}
                    placeholder="e.g. 800W"
                    className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1">Key Features *</label>
                <textarea 
                  name="features"
                  value={product.features}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="e.g. High torque, 2-speed gearbox, LED light..."
                  className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1">Application</label>
                <textarea 
                  name="application"
                  value={product.application}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g. Professional construction, DIY projects..."
                  className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium resize-none"
                />
              </div>

              <button 
                onClick={() => handleGenerate(false)}
                disabled={loading}
                className="w-full bg-[#1A1A1A] text-white font-black uppercase italic py-4 flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Generate Content
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-orange-100 border-2 border-orange-500 p-4 text-xs">
            <p className="font-bold uppercase mb-1 text-orange-800">Pro Tip:</p>
            <p className="text-orange-700">Be specific with features to get better marketing copy. Mentioning specific technologies like "Brushless" or "Li-ion" helps Gemini generate more technical value.</p>
          </div>
        </section>

        {/* Output Section */}
        <section className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!results && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[400px] border-4 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 p-8 text-center"
              >
                <Wrench className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-black uppercase italic mb-2">Ready for production</h3>
                <p className="max-w-md">Fill in the product details on the left and click generate to create high-conversion marketing materials.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                  <Zap className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-2 animate-pulse">Analyzing Product...</h3>
                <p className="text-sm text-gray-500 max-w-xs">Our AI expert is crafting your professional marketing content. This usually takes 3-5 seconds.</p>
              </motion.div>
            )}

            {results && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => handleGenerate(false)}
                    className="flex-1 bg-white border-2 border-[#1A1A1A] py-3 px-6 font-black uppercase italic text-sm flex items-center justify-center gap-2 hover:bg-[#F5F5F5] transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button 
                    onClick={() => handleGenerate(true)}
                    className="flex-1 bg-orange-500 text-white border-2 border-[#1A1A1A] py-3 px-6 font-black uppercase italic text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <Zap className="w-4 h-4" />
                    Make it Persuasive
                  </button>
                </div>

                {/* Facebook Post */}
                <div className="bg-white border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
                  <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-5 h-5 text-blue-400" />
                      <h3 className="font-black uppercase italic text-sm tracking-widest">Facebook Marketing Post</h3>
                    </div>
                  </div>
                  
                  <div className="divide-y-2 divide-[#1A1A1A]">
                    {/* English Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-800 px-2 py-1">English</span>
                        <button 
                          onClick={() => copyToClipboard(results.facebookPost.english, 'fb-en')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'fb-en' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'fb-en' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed">
                        {results.facebookPost.english}
                      </div>
                    </div>

                    {/* Chinese Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-800 px-2 py-1">Chinese</span>
                        <button 
                          onClick={() => copyToClipboard(results.facebookPost.chinese, 'fb-zh')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'fb-zh' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'fb-zh' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed">
                        {results.facebookPost.chinese}
                      </div>
                    </div>

                    {/* Spanish Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800 px-2 py-1">Spanish</span>
                        <button 
                          onClick={() => copyToClipboard(results.facebookPost.spanish, 'fb-es')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'fb-es' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'fb-es' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed">
                        {results.facebookPost.spanish}
                      </div>
                    </div>

                    {/* Hashtags Section */}
                    <div className="p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-200 text-gray-800 px-2 py-1">Hashtags</span>
                        <button 
                          onClick={() => copyToClipboard(results.facebookPost.hashtags, 'fb-tags')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'fb-tags' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'fb-tags' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-blue-600">
                        {results.facebookPost.hashtags}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Page */}
                <div className="bg-white border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
                  <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-400" />
                      <h3 className="font-black uppercase italic text-sm tracking-widest">Product Detail Page</h3>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(results.detailPage, 'dp')}
                      className="text-xs font-bold uppercase flex items-center gap-1 hover:text-orange-400 transition-colors"
                    >
                      {copied === 'dp' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === 'dp' ? 'Copied!' : 'Copy Content'}
                    </button>
                  </div>
                  <div className="p-6 whitespace-pre-wrap font-medium text-sm leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                    {results.detailPage}
                  </div>
                </div>

                {/* Image Prompt */}
                <div className="bg-white border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
                  <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                      <h3 className="font-black uppercase italic text-sm tracking-widest">AI Image Prompts</h3>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(results.imagePrompt, 'ip')}
                      className="text-xs font-bold uppercase flex items-center gap-1 hover:text-orange-400 transition-colors"
                    >
                      {copied === 'ip' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === 'ip' ? 'Copied!' : 'Copy Content'}
                    </button>
                  </div>
                  <div className="p-6 whitespace-pre-wrap font-mono text-xs leading-relaxed bg-[#F9F9F9] border-t border-gray-100">
                    {results.imagePrompt}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] uppercase tracking-[0.3em] font-bold">
        © 2026 XCORT INDUSTRIAL TOOLS • POWERED BY GEMINI AI
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1A1A1A;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
