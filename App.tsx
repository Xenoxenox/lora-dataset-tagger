
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { TagData, TaggedImage, TagField, DEFAULT_TAGS, CustomAPIConfig } from './types';
import { autoTagImage } from './services/geminiService';
import { autoTagImageOpenAI } from './services/openaiCompatService';
import { fileToBase64, downloadTextFile } from './utils/fileUtils';
import { translations, Language } from './i18n';
import JSZip from 'jszip';

// Icon Components
const IconRobot = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
);
const IconSave = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
);
const IconZip = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
);
const IconLock = ({ locked }: { locked: boolean }) => (
  <svg className={`w-3.5 h-3.5 ${locked ? 'text-amber-400' : 'text-slate-500'}`} fill={locked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconLang = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.188 15.287 5.711 18.287" /></svg>
);
const IconQuestion = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const IconResize = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-7 7m7-7L5 5" /></svg>
);
const IconChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const IconChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const IconSettings = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const getAspectRatio = (width: number, height: number) => {
  if (!width || !height) return '';

  const gcd = (a: number, b: number): number => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const next = x % y;
      x = y;
      y = next;
    }
    return x;
  };

  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const userLang = navigator.language.toLowerCase();
    return userLang.startsWith('zh') ? 'zh' : 'en';
  });
  const t = translations[lang];

  const [images, setImages] = useState<TaggedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showResizeDialog, setShowResizeDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [resizeOriginalDimensions, setResizeOriginalDimensions] = useState<{ width: number; height: number } | null>(null);

  const [memoizeConfig, setMemoizeConfig] = useState<boolean>(() => {
    const saved = localStorage.getItem('lora_tagger_memoize');
    return saved === null ? true : saved === 'true';
  });

  const [apiConfig, setApiConfig] = useState<CustomAPIConfig>(() => {
    const shouldMemoize = localStorage.getItem('lora_tagger_memoize');
    const memoizeEnabled = shouldMemoize === null ? true : shouldMemoize === 'true';
    if (memoizeEnabled) {
      const saved = localStorage.getItem('lora_tagger_api_config');
      if (saved) return JSON.parse(saved);
    }
    return { enabled: false, baseUrl: '', apiKey: '', model: '' };
  });
  
  const [frozenFields, setFrozenFields] = useState<Record<TagField, boolean>>({
    character: false, style: false, clothing: false, expression: false,
    action: false, position: false, background: false, lighting: false,
    atmosphere: false, objects: false, other: false
  });
  const [frozenValues, setFrozenValues] = useState<TagData>({ ...DEFAULT_TAGS });

  const [resizeMaxSide, setResizeMaxSide] = useState<number>(1024);

  const currentImage = images[currentIndex] || null;

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('lora_tagger_tutorial_seen');
    if (!hasSeenTutorial) setShowTutorial(true);
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('lora_tagger_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const removeImage = useCallback((indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setCurrentIndex(prev => {
      if (indexToRemove < prev) return prev - 1;
      if (indexToRemove === prev) return Math.max(0, prev - 1);
      return prev;
    });
  }, []);

  const toggleFreeze = (field: TagField) => {
    setFrozenFields(prev => {
      const isNowLocked = !prev[field];
      if (isNowLocked && currentImage) {
        setFrozenValues(v => ({ ...v, [field]: currentImage.tags[field] }));
      }
      return { ...prev, [field]: isNowLocked };
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newImages: TaggedImage[] = files.map(file => {
      const initialTags = { ...DEFAULT_TAGS };
      (Object.keys(frozenFields) as TagField[]).forEach(f => {
        if (frozenFields[f]) initialTags[f] = frozenValues[f];
      });

      return {
        id: Math.random().toString(36).substring(2, 11),
        file,
        previewUrl: URL.createObjectURL(file),
        tags: initialTags,
        isAutoTagged: false,
        isEdited: false
      };
    });

    setImages(prev => [...prev, ...newImages]);
    if (images.length === 0) setCurrentIndex(0);
    setStatus({ message: t.statusImport(files.length), type: 'info' });
  };

  const updateTag = (field: TagField, value: string) => {
    if (!currentImage) return;
    setImages(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        isEdited: true,
        tags: { ...updated[currentIndex].tags, [field]: value }
      };
      return updated;
    });
    if (frozenFields[field]) {
      setFrozenValues(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAutoTag = async () => {
    if (!currentImage || isAutoTagging) return;
    setIsAutoTagging(true);
    setStatus({ message: t.statusAiStart, type: 'info' });
    try {
      const base64 = await fileToBase64(currentImage.file);
      let aiTags: TagData;

      // Custom endpoints must be OpenAI chat-completions compatible.
      if (apiConfig.enabled && apiConfig.baseUrl && apiConfig.apiKey && apiConfig.model) {
        aiTags = await autoTagImageOpenAI(base64, currentImage.file.type, apiConfig);
      } else {
        aiTags = await autoTagImage(base64, currentImage.file.type);
      }

      setImages(prev => {
        const updated = [...prev];
        const existingTags = updated[currentIndex].tags;
        const mergedTags = { ...aiTags };
        // Frozen fields preserve manually curated character/style anchors across AI runs.
        (Object.keys(frozenFields) as TagField[]).forEach(f => {
          if (frozenFields[f]) mergedTags[f] = existingTags[f];
        });
        updated[currentIndex] = { ...updated[currentIndex], tags: mergedTags, isAutoTagged: true };
        return updated;
      });
      setStatus({ message: t.statusAiSuccess, type: 'success' });
    } catch (e) {
      setStatus({ message: t.statusAiFail, type: 'error' });
    } finally {
      setIsAutoTagging(false);
    }
  };

  const handleApplyResize = async () => {
    if (!currentImage) return;

    try {
      const img = new Image();
      img.src = currentImage.previewUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
      });

      const { naturalWidth: width, naturalHeight: height } = img;
      const longestSide = Math.max(width, height);

      // NewbieLoraTrainer buckets by aspect ratio, so this tool only downsizes oversized images.
      if (longestSide <= resizeMaxSide) {
        setShowResizeDialog(false);
        setStatus({ message: t.resize.skipped(width, height), type: 'info' });
        return;
      }

      const scale = resizeMaxSide / longestSide;
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = currentImage.file.type || 'image/jpeg';
      canvas.toBlob((blob) => {
        if (!blob) return;
        const newFile = new File([blob], currentImage.file.name, { type: mimeType });
        const newUrl = URL.createObjectURL(newFile);

        setImages(prev => {
          const updated = [...prev];
          URL.revokeObjectURL(updated[currentIndex].previewUrl);
          updated[currentIndex] = {
            ...updated[currentIndex],
            file: newFile,
            previewUrl: newUrl,
            isEdited: true
          };
          return updated;
        });
        setShowResizeDialog(false);
        setStatus({ message: t.resize.success(targetWidth, targetHeight), type: 'success' });
      }, mimeType, 0.95);
    } catch (e) {
      setStatus({ message: t.resize.failed, type: 'error' });
    }
  };

  useEffect(() => {
    if (!showResizeDialog || !currentImage) {
      setResizeOriginalDimensions(null);
      return;
    }

    let active = true;
    const img = new Image();
    img.src = currentImage.previewUrl;
    img.onload = () => {
      if (!active) return;
      setResizeOriginalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      if (!active) return;
      setResizeOriginalDimensions(null);
    };

    return () => {
      active = false;
    };
  }, [showResizeDialog, currentImage?.previewUrl]);

  useEffect(() => {
    if (currentImage && !currentImage.isAutoTagged && !currentImage.isEdited) {
      let needsUpdate = false;
      const nextTags = { ...currentImage.tags };
      (Object.keys(frozenFields) as TagField[]).forEach(f => {
        if (frozenFields[f] && nextTags[f] !== frozenValues[f]) {
          nextTags[f] = frozenValues[f];
          needsUpdate = true;
        }
      });
      if (needsUpdate) {
        setImages(prev => {
          const updated = [...prev];
          updated[currentIndex] = { ...updated[currentIndex], tags: nextTags };
          return updated;
        });
      }
    }
  }, [currentIndex, frozenFields, frozenValues, currentImage]);

  const getFormattedCaption = (img: TaggedImage) => {
    // Newbie prompts treat style as an explicit style block before the remaining Danbooru tags.
    const { style, ...rest } = img.tags;
    const parts: string[] = [];
    if (style?.trim()) {
      const s = style.trim();
      parts.push(s.startsWith('<style>') ? s : `<style>${s}</style>`);
    }
    const others = (Object.values(rest) as string[]).map(v => v.trim()).filter(v => !!v);
    parts.push(...others);
    return parts.join(", ");
  };

  const captionText = useMemo(() => {
    if (!currentImage) return "";
    return getFormattedCaption(currentImage);
  }, [currentImage]);

  const saveTags = () => {
    if (!currentImage || !captionText) return;
    const name = currentImage.file.name.replace(/\.[^/.]+$/, "") + ".txt";
    downloadTextFile(captionText, name);
    setStatus({ message: t.statusExport(name), type: 'success' });
  };

  const handleExportAll = async () => {
    if (images.length === 0 || isExporting) return;
    setIsExporting(true);
    setStatus({ message: t.statusZipping, type: 'info' });

    try {
      const zip = new JSZip();
      images.forEach(img => {
        const caption = getFormattedCaption(img);
        const fileName = img.file.name.replace(/\.[^/.]+$/, "") + ".txt";
        zip.file(fileName, caption);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lora_dataset_${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus({ message: t.statusZipSuccess, type: 'success' });
    } catch (e) {
      setStatus({ message: "Failed to create ZIP", type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('lora_tagger_memoize', String(memoizeConfig));
    if (memoizeConfig) {
      localStorage.setItem('lora_tagger_api_config', JSON.stringify(apiConfig));
    } else {
      localStorage.removeItem('lora_tagger_api_config');
    }
    setStatus({ message: t.settings.saved, type: 'success' });
    setShowSettings(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <IconQuestion />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{t.tutorial.title}</h2>
              </div>
              <div className="space-y-6">
                {[t.tutorial.step1, t.tutorial.step2, t.tutorial.step3, t.tutorial.step4].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-none w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed pt-1.5">{step}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={closeTutorial}
                className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {t.tutorial.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <IconSettings />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{t.settings.title}</h2>
              </div>

              <div className="space-y-6">
                {/* Enable Custom API Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <label className="text-sm font-bold text-slate-200">{t.settings.useCustom}</label>
                  <button
                    onClick={() => setApiConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      apiConfig.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${
                      apiConfig.enabled ? 'left-8' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* API Configuration Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                      {t.settings.baseUrl}
                    </label>
                    <input
                      type="text"
                      value={apiConfig.baseUrl}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder={t.settings.baseUrlPlaceholder}
                      disabled={!apiConfig.enabled}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                      {t.settings.apiKey}
                    </label>
                    <input
                      type="password"
                      value={apiConfig.apiKey}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={t.settings.apiKeyPlaceholder}
                      disabled={!apiConfig.enabled}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                      {t.settings.model}
                    </label>
                    <input
                      type="text"
                      value={apiConfig.model}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, model: e.target.value }))}
                      placeholder={t.settings.modelPlaceholder}
                      disabled={!apiConfig.enabled}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Memoize Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-bold text-slate-200">{t.settings.memoize}</label>
                  <span className="text-[11px] text-slate-500">{t.settings.memoizeHint}</span>
                </div>
                <button
                  onClick={() => setMemoizeConfig(prev => !prev)}
                  className={`relative w-14 h-7 rounded-full transition-all shrink-0 ${
                    memoizeConfig ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${
                    memoizeConfig ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  {t.settings.save}
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-2xl transition-all active:scale-95"
                >
                  {t.settings.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resize Modal */}
      {showResizeDialog && currentImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[201] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[80vh] rounded-3xl flex overflow-hidden shadow-2xl min-h-0">
            {/* Left: Preview Area */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-8 min-h-0">
              <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <img 
                  src={currentImage.previewUrl} 
                  className="max-w-full max-h-[68vh] block object-contain"
                  alt="Resize target"
                />
              </div>
            </div>

            {/* Right: Controls Area */}
            <div className="w-[340px] border-l border-slate-800 p-8 flex flex-col gap-8 bg-slate-900/50 min-h-0">
              <div>
                <h3 className="text-xl font-bold mb-2">{t.resize.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.resize.note}</p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.resize.resolution}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-200">
                  <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1">
                    {resizeOriginalDimensions ? `${resizeOriginalDimensions.width} × ${resizeOriginalDimensions.height}` : '...'}
                  </span>
                  <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-indigo-300">
                    {resizeOriginalDimensions ? getAspectRatio(resizeOriginalDimensions.width, resizeOriginalDimensions.height) : '...'}
                  </span>
                </div>
              </div>

              {/* Resolution Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.resize.resolution}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[512, 768, 1024, 1536].map(res => (
                    <button 
                      key={res}
                      onClick={() => setResizeMaxSide(res)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        resizeMaxSide === res ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {res}px
                    </button>
                  ))}
                </div>
              </div>

              {/* GPU Recommendations Tip */}
              <div className="mt-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 min-h-0">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">{t.resize.recommendTitle}</div>
                <p className="text-[11px] leading-relaxed text-amber-100/80 font-mono">
                  {t.resize.recommend}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleApplyResize}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  {t.resize.apply}
                </button>
                <button 
                  onClick={() => setShowResizeDialog(false)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-2xl transition-all active:scale-95"
                >
                  {t.resize.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <IconRobot />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight uppercase text-indigo-100">{t.title}</h1>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight">{t.subtitle}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-white transition"
            title="Settings"
          >
            <IconSettings />
          </button>

          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 text-slate-400 hover:text-white transition"
            title="Help"
          >
            <IconQuestion />
          </button>

          <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition text-slate-400 hover:text-white text-[10px] font-bold uppercase"
          >
            <IconLang />
            {lang === 'en' ? '中文' : 'English'}
          </button>
          
          <label className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 px-4 py-1.5 rounded-full cursor-pointer transition-all active:scale-95 shadow-lg shadow-indigo-600/10">
            <input type="file" multiple accept="image/*" onChange={onFileChange} className="hidden" />
            <span className="text-xs font-bold text-white uppercase tracking-tight">{t.import}</span>
          </label>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* PANEL 1: Dataset Browser */}
        <aside className={`relative transition-[width] duration-200 ease-out bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-0 ${isLibraryCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-full lg:w-[220px] max-h-44 lg:max-h-none border-b lg:border-b-0'}`}>
          <div className="p-3 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.library} ({images.length})</span>
            <button
              onClick={() => setIsLibraryCollapsed(true)}
              className="hidden lg:inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Collapse library"
              aria-label="Collapse library"
            >
              <IconChevronLeft />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto p-3 flex gap-3 lg:block lg:space-y-3 custom-scrollbar">
            {images.map((img, idx) => {
              const isTagged = img.isAutoTagged || img.isEdited;
              return (
                <button 
                  key={img.id} 
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-24 lg:w-full shrink-0 group transition-all duration-200 ${idx === currentIndex ? 'scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`aspect-square rounded-xl overflow-hidden border-2 transition-all shadow-xl ${
                    idx === currentIndex ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-800'
                  }`}>
                    <img src={img.previewUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  {isTagged && (
                    <div className="absolute top-1 left-1 bg-emerald-600 text-[8px] px-1.5 py-0.5 rounded font-bold shadow-md uppercase">
                      {t.tagged}
                    </div>
                  )}
                  <div className={`absolute -right-1 -top-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform ${idx === currentIndex ? 'hidden' : ''}`} onClick={(e) => { e.stopPropagation(); removeImage(idx); }}>
                    <span className="text-[10px]">✕</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* PANEL 2: Main Stage */}
        <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-950 relative overflow-hidden">
          {currentImage ? (
            <>
              <div className="flex-1 min-h-0 relative flex items-center justify-center p-4 sm:p-8 bg-grid-slate-800/[0.05] overflow-hidden">
                <div className="relative max-w-full max-h-full rounded-2xl shadow-2xl overflow-hidden border border-slate-800 group">
                  <img src={currentImage.previewUrl} className="max-w-full max-h-[65vh] object-contain block" alt="Current" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-4">
                     <button onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)} className="p-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition disabled:opacity-30" disabled={currentIndex === 0}>
                        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     </button>
                     <button onClick={() => currentIndex < images.length - 1 && setCurrentIndex(currentIndex + 1)} className="p-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition disabled:opacity-30" disabled={currentIndex === images.length - 1}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     </button>
                  </div>
                </div>
              </div>

              {isLibraryCollapsed && (
                <button
                  onClick={() => setIsLibraryCollapsed(false)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-9 h-14 rounded-r-xl border border-l-0 border-slate-700 bg-slate-900 text-slate-300 shadow-lg shadow-black/30 hover:bg-slate-800 hover:text-white transition"
                  title="Expand library"
                  aria-label="Expand library"
                >
                  <IconChevronRight />
                </button>
              )}

              <div className="h-56 min-h-0 bg-slate-900 border-t border-slate-800 p-4 sm:p-6 flex flex-col gap-4 shrink-0 overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <button onClick={handleAutoTag} disabled={isAutoTagging} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                      {isAutoTagging ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <IconRobot />}
                      {t.generate}
                    </button>
                    <button onClick={() => setShowResizeDialog(true)} className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-xs transition-all active:scale-95">
                      <IconResize /> {t.resize.button}
                    </button>
                    <button onClick={saveTags} className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-xs transition-all active:scale-95">
                      <IconSave /> {t.export}
                    </button>
                    <button onClick={handleExportAll} disabled={isExporting} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/10">
                      {isExporting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <IconZip />}
                      {t.exportAll}
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 uppercase">
                    {t.step} {currentIndex + 1} / {images.length}
                  </div>
                </div>

                <div className="flex-1 min-h-0 bg-slate-950 rounded-xl border border-slate-800 p-4 pt-7 relative group flex flex-col overflow-hidden">
                  <div className="absolute top-2 left-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">{t.outputHeader}</div>
                  <div className="text-xs font-mono leading-relaxed text-indigo-300/90 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-8 whitespace-pre-wrap break-all">
                    {captionText || <span className="text-slate-700 italic">{t.placeholder}</span>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none">
              <div className="w-32 h-32 mb-6 border-4 border-dashed border-slate-800 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="1.5"/></svg>
              </div>
              <p className="text-xl font-light">{t.importHint}</p>
            </div>
          )}
        </section>

        {/* PANEL 3: Property Panel */}
        <aside className="w-full lg:w-[380px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 min-h-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-400">🏷️</span>
            <span className="text-sm font-bold uppercase tracking-wider">{t.editorHeader}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar pb-20">
            {currentImage ? (
              (Object.keys(currentImage.tags) as TagField[]).map(field => (
                <div key={field} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.fields[field]}</label>
                    <button 
                      onClick={() => toggleFreeze(field)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all text-[9px] font-bold border ${
                        frozenFields[field] ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-transparent hover:border-slate-700'
                      }`}
                    >
                      <IconLock locked={frozenFields[field]} />
                      {frozenFields[field] ? t.frozen : t.freeze}
                    </button>
                  </div>
                  <textarea 
                    value={currentImage.tags[field]}
                    onChange={(e) => updateTag(field, e.target.value)}
                    placeholder={t.placeholder}
                    className={`w-full min-h-[60px] bg-slate-950 border rounded-xl px-4 py-3 text-xs leading-relaxed focus:outline-none transition-all ${
                      frozenFields[field] 
                        ? 'border-amber-500/20 text-slate-400' 
                        : 'border-slate-800 text-slate-200 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5'
                    }`}
                  />
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-xs text-slate-600 italic">{t.propertiesHint}</div>
            )}
          </div>
        </aside>
      </div>

      {/* Ephemeral Status Messages */}
      {status && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 z-[100] border border-white/10 ${
          status.type === 'success' ? 'bg-emerald-600' : status.type === 'error' ? 'bg-red-600' : 'bg-indigo-600'
        }`}>
          <div className="text-xs font-bold text-white uppercase tracking-tight">{status.message}</div>
          <button onClick={() => setStatus(null)} className="hover:scale-125 transition">✕</button>
        </div>
      )}

      {/* Global Style Inject */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .bg-grid-slate-800 { background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 20px 20px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation-duration: 0.3s; animation-fill-mode: forwards; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in; }
        .slide-in-from-bottom-5 { transform: translateY(5px); }
      `}} />
    </div>
  );
};

export default App;
