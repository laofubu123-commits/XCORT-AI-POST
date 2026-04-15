import React, { useState } from 'react';
import { 
  Wrench, 
  Facebook, 
  FileText, 
  Image as ImageIcon, 
  Video,
  Copy, 
  RefreshCw, 
  Zap, 
  CheckCircle2,
  Loader2,
  ChevronRight,
  Settings,
  X,
  Clapperboard,
  History,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductData, GeneratedContent, AISettings, AIProvider, HistoryRecord } from './types';
import { generateMarketingContent } from './services/aiService';

const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  gemini: ['gemini-3-flash-preview', 'gemini-3.1-pro-preview'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner']
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Analyzing product parameters...",
    "Generating multilingual marketing copy...",
    "Crafting professional image prompts...",
    "Designing 30s video storyboard...",
    "Finalizing industrial-grade content..."
  ];
  const [copied, setCopied] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem('XCORT_AI_HISTORY');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [settings, setSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('XCORT_AI_SETTINGS');
    if (saved) return JSON.parse(saved);
    return {
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      apiKeys: {
        gemini: localStorage.getItem('XCORT_GEMINI_API_KEY') || '',
        openai: '',
        deepseek: ''
      }
    };
  });

  const [product, setProduct] = useState<ProductData>({
    name: '',
    modelNumber: '',
    voltage: '',
    power: '',
    features: '',
    sellingPoints: ''
  });
  const [results, setResults] = useState<GeneratedContent | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleGenerate = async (persuasive = false) => {
    if (!product.name || !product.modelNumber || !product.features) {
      setError('Please fill in the required fields (Name, Model Number, Features)');
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setError(null);

    // Progress simulation for better UX
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 3000);

    try {
      // Create a timeout promise (240 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out. The AI is taking longer than expected to generate the full industrial script. Please try again or check your network.')), 240000)
      );

      const content = await Promise.race([
        generateMarketingContent(product, settings, persuasive),
        timeoutPromise
      ]) as GeneratedContent;
      
      setResults(content);

      // Save to history
      const newRecord: HistoryRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        product: { ...product },
        results: content
      };
      setHistory(prev => {
        const updated = [newRecord, ...prev].slice(0, 50); // Keep last 50 records
        localStorage.setItem('XCORT_AI_HISTORY', JSON.stringify(updated));
        return updated;
      });

    } catch (err: any) {
      console.error('Generation failed:', err);
      const message = err.message || 'Failed to generate content. Please try again.';
      setError(message);
      if (message.toLowerCase().includes('api key')) {
        setShowSettings(true);
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveSettings = () => {
    localStorage.setItem('XCORT_AI_SETTINGS', JSON.stringify(settings));
    setShowSettings(false);
  };

  const handleProviderChange = (provider: AIProvider) => {
    setSettings(prev => ({
      ...prev,
      provider,
      model: PROVIDER_MODELS[provider][0]
    }));
  };

  const handleApiKeyChange = (provider: keyof AISettings['apiKeys'], value: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value
      }
    }));
  };

  const safeText = (val: any, fallback = "Content generation failed for this section.") => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    try {
      return JSON.stringify(val, null, 2);
    } catch (e) {
      return fallback;
    }
  };

  const loadHistoryRecord = (record: HistoryRecord) => {
    setProduct(record.product);
    setResults(record.results);
    setShowHistory(false);
  };

  const deleteHistoryRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('XCORT_AI_HISTORY', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.removeItem('XCORT_AI_HISTORY');
    }
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
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold">Marketing Tool v1.12</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Industrial Grade Content Generation</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-sm border border-orange-500/30">
                  {settings.provider}: {settings.model}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="History"
              >
                <History className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white border-4 border-[#1A1A1A] p-6 shadow-[16px_16px_0px_0px_rgba(26,26,26,1)] w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <button 
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#1A1A1A] p-2 text-white">
                  <History className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-wider">Generation History</h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No generation history yet.</p>
                  </div>
                ) : (
                  history.map((record) => (
                    <div 
                      key={record.id}
                      onClick={() => loadHistoryRecord(record)}
                      className="group flex items-center justify-between p-4 border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{record.product.name || 'Unnamed Product'}</h3>
                          <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 text-gray-600">{record.product.modelNumber || 'No Model'}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Load</span>
                        <button
                          onClick={(e) => deleteHistoryRecord(record.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {history.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-gray-100 flex justify-end">
                  <button 
                    onClick={clearHistory}
                    className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All History
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white border-4 border-[#1A1A1A] p-8 shadow-[16px_16px_0px_0px_rgba(26,26,26,1)] w-full max-w-md"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-[#1A1A1A] pb-2 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                App Settings
              </h2>
              
              <div className="space-y-6">
                {/* Provider Selection */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-2">AI Provider</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['gemini', 'openai', 'deepseek'] as AIProvider[]).map(p => (
                      <button
                        key={p}
                        onClick={() => handleProviderChange(p)}
                        className={`py-2 px-1 text-[10px] font-black uppercase border-2 transition-all ${
                          settings.provider === p 
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                            : 'bg-white text-[#1A1A1A] border-gray-200 hover:border-[#1A1A1A]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1">Model</label>
                  <select
                    value={settings.model}
                    onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-mono text-xs"
                  >
                    {PROVIDER_MODELS[settings.provider].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* API Key Input */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1">
                    {settings.provider.toUpperCase()} API Key
                  </label>
                  <input 
                    type="password" 
                    value={settings.apiKeys[settings.provider]}
                    onChange={(e) => handleApiKeyChange(settings.provider, e.target.value)}
                    placeholder={`Enter your ${settings.provider} API Key`}
                    className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-mono text-sm"
                  />
                  <p className="mt-2 text-[10px] text-gray-500 leading-relaxed uppercase font-bold">
                    {settings.provider === 'gemini' && (
                      <>Get a key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">AI Studio</a>.</>
                    )}
                    {settings.provider === 'openai' && (
                      <>Get a key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">OpenAI Dashboard</a>.</>
                    )}
                    {settings.provider === 'deepseek' && (
                      <>Get a key at <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">DeepSeek Dashboard</a>.</>
                    )}
                  </p>
                </div>
                
                <button 
                  onClick={saveSettings}
                  className="w-full bg-[#1A1A1A] text-white font-black uppercase italic py-3 hover:bg-orange-500 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-2 mb-6">
              <h2 className="text-lg font-black uppercase italic flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Product Parameters
              </h2>
              <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 border border-gray-200">
                {settings.provider} / {settings.model}
              </span>
            </div>
            
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
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1">Tool Features / Selling Points (工具特点/卖点)</label>
                <textarea 
                  name="sellingPoints"
                  value={product.sellingPoints}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g. 极具性价比，续航时间长，适合专业施工..."
                  className="w-full bg-[#F5F5F5] border-2 border-[#1A1A1A] p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium resize-none"
                />
              </div>

              <button 
                onClick={() => handleGenerate(false)}
                disabled={loading}
                className="w-full bg-[#1A1A1A] text-white font-black uppercase italic py-4 flex flex-col items-center justify-center gap-1 hover:bg-orange-500 transition-colors disabled:opacity-80 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </div>
                    <span className="text-[9px] normal-case font-medium opacity-70 animate-pulse">
                      {loadingStep < loadingSteps.length - 1 ? loadingSteps[loadingStep] : "Almost there, finalizing the details..."}
                    </span>
                    {/* Progress bar */}
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-orange-400 transition-all duration-1000" 
                      style={{ 
                        width: loadingStep < loadingSteps.length - 1 
                          ? `${((loadingStep + 1) / loadingSteps.length) * 100}%` 
                          : "95%" 
                      }} 
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    Generate Content
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-500 p-4 flex items-start gap-3"
                >
                  <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-700 leading-tight">{error}</p>
                </motion.div>
              )}
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
                          onClick={() => copyToClipboard(safeText(results.facebookPost?.english, ''), 'fb-en')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'fb-en' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'fb-en' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed">
                        {safeText(results.facebookPost?.english)}
                      </div>
                    </div>

                    {/* Chinese Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-800 px-2 py-1">Chinese</span>
                        <button 
                          onClick={() => copyToClipboard(safeText(results.facebookPost?.chinese, ''), 'fb-zh')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'fb-zh' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'fb-zh' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed">
                        {safeText(results.facebookPost?.chinese)}
                      </div>
                    </div>

                    {/* Spanish Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800 px-2 py-1">Spanish</span>
                        <button 
                          onClick={() => copyToClipboard(safeText(results.facebookPost?.spanish, ''), 'fb-es')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'fb-es' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'fb-es' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed">
                        {safeText(results.facebookPost?.spanish)}
                      </div>
                    </div>

                    {/* Hashtags Section */}
                    <div className="p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-200 text-gray-800 px-2 py-1">Hashtags</span>
                        <button 
                          onClick={() => copyToClipboard(safeText(results.facebookPost?.hashtags, ''), 'fb-tags')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'fb-tags' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'fb-tags' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-blue-600">
                        {safeText(results.facebookPost?.hashtags, "")}
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
                  </div>
                  <div className="divide-y-2 divide-[#1A1A1A]">
                    {/* English Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-800 px-2 py-1">English</span>
                        <button 
                          onClick={() => copyToClipboard(safeText(results.detailPage?.english, ''), 'dp-en')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'dp-en' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'dp-en' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                        {safeText(results.detailPage?.english)}
                      </div>
                    </div>
                    {/* Chinese Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-800 px-2 py-1">Chinese</span>
                        <button 
                          onClick={() => copyToClipboard(safeText(results.detailPage?.chinese, ''), 'dp-zh')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'dp-zh' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'dp-zh' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-sm leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                        {safeText(results.detailPage?.chinese)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Script */}
                <div className="bg-white border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
                  <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clapperboard className="w-5 h-5 text-green-400" />
                      <h3 className="font-black uppercase italic text-sm tracking-widest">30s Video Storyboard Script</h3>
                    </div>
                    <button 
                      onClick={() => {
                        const fullScript = JSON.stringify(results.videoScript || {}, null, 2);
                        copyToClipboard(fullScript, 'vs-full');
                      }}
                      className="text-xs font-bold uppercase flex items-center gap-1 hover:text-orange-400 transition-colors"
                    >
                      {copied === 'vs-full' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === 'vs-full' ? 'Copied!' : 'Copy Full Script'}
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {[1, 2, 3].map((partNum) => {
                      const partKey = `part${partNum}` as keyof typeof results.videoScript;
                      const partData = results.videoScript?.[partKey];
                      const partTitles = ['Part 1: The Problem (0-10s)', 'Part 2: The Solution (10-20s)', 'Part 3: The Result (20-30s)'];
                      
                      if (!Array.isArray(partData) || partData.length === 0) return null;

                      return (
                        <div key={partKey} className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest bg-orange-100 text-orange-800 px-3 py-1 inline-block border-l-4 border-orange-500">
                            {partTitles[partNum - 1]}
                          </h4>
                          <div className="overflow-x-auto border-2 border-gray-100">
                            <table className="w-full text-[10px] text-left border-collapse">
                              <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                  <th className="p-2 font-black uppercase border-r border-gray-200">Shot</th>
                                  <th className="p-2 font-black uppercase border-r border-gray-200">Duration</th>
                                  <th className="p-2 font-black uppercase border-r border-gray-200">Visual Description</th>
                                  <th className="p-2 font-black uppercase border-r border-gray-200">Parameters</th>
                                  <th className="p-2 font-black uppercase">Action/Rhythm</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y border-gray-200">
                                {partData.map((shot, idx) => {
                                  if (!shot) return null;
                                  return (
                                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-2 font-mono font-bold border-r border-gray-100">{shot?.id || '-'}</td>
                                    <td className="p-2 font-mono border-r border-gray-100">{shot?.duration || '-'}</td>
                                    <td className="p-2 border-r border-gray-100 leading-relaxed">
                                      <div className="space-y-1">
                                        <p className="text-gray-900 font-medium">{safeText(shot?.descriptionZh, '')}</p>
                                        <p className="text-gray-500 italic text-[9px]">{safeText(shot?.descriptionEn, '')}</p>
                                      </div>
                                    </td>
                                    <td className="p-2 border-r border-gray-100">
                                      <div className="space-y-1">
                                        <p><span className="opacity-50 uppercase font-bold text-[8px]">Type:</span> {safeText(shot?.shotType, '-')}</p>
                                        <p><span className="opacity-50 uppercase font-bold text-[8px]">Angle:</span> {safeText(shot?.angle, '-')}</p>
                                        <p><span className="opacity-50 uppercase font-bold text-[8px]">Move:</span> {safeText(shot?.movement, '-')}</p>
                                        <p><span className="opacity-50 uppercase font-bold text-[8px]">Light:</span> {safeText(shot?.lighting, '-')}</p>
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <div className="space-y-1">
                                        <p className="text-gray-900 font-medium">{safeText(shot?.actionZh, '')}</p>
                                        <p className="text-gray-500 italic text-[9px]">{safeText(shot?.actionEn, '')}</p>
                                        <p className="mt-1"><span className="opacity-50 uppercase font-bold text-[8px]">Rhythm:</span> {safeText(shot?.rhythm, '-')}</p>
                                      </div>
                                    </td>
                                  </tr>
                                )})}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Image Prompt */}
                <div className="bg-white border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
                  <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                      <h3 className="font-black uppercase italic text-sm tracking-widest">AI Image Prompts</h3>
                    </div>
                  </div>
                  <div className="divide-y-2 divide-[#1A1A1A]">
                    {/* English Section */}
                    <div className="p-6 bg-[#F9F9F9]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-800 px-2 py-1">English</span>
                        <button 
                          onClick={() => copyToClipboard(safeText(results.imagePrompt?.english, ''), 'ip-en')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'ip-en' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'ip-en' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                        {safeText(results.imagePrompt?.english)}
                      </div>
                    </div>
                    {/* Chinese Section */}
                    <div className="p-6 bg-[#F9F9F9]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-800 px-2 py-1">Chinese</span>
                        <button 
                          onClick={() => copyToClipboard(safeText(results.imagePrompt?.chinese, ''), 'ip-zh')}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copied === 'ip-zh' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === 'ip-zh' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                        {safeText(results.imagePrompt?.chinese)}
                      </div>
                    </div>
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
