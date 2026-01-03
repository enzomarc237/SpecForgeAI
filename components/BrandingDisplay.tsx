import React, { useState } from 'react';
import { BrandingData, LogoConcept } from '../types';
import { Button } from './Button';
import JSZip from 'jszip';

interface BrandingDisplayProps {
  data: BrandingData;
  onUpdateLogo: (newUrl: string, newPrompt: string) => void;
}

const ColorCard: React.FC<{ name: string; hex: string }> = ({ name, hex }) => (
  <div className="flex flex-col gap-2">
    <div 
      className="h-24 rounded-lg shadow-lg border border-slate-700/50 relative group overflow-hidden"
      style={{ backgroundColor: hex }}
    >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </div>
    <div className="flex justify-between items-center px-1">
      <span className="text-sm font-medium text-slate-400 capitalize">{name}</span>
      <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded select-all">{hex}</span>
    </div>
  </div>
);

// We need to import the service dynamically or pass it as a prop to avoid circular deps if any, 
// but direct import is fine in this architecture.
import { generateLogoImage } from '../services/geminiService';

export const BrandingDisplay: React.FC<BrandingDisplayProps> = ({ data, onUpdateLogo }) => {
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingAppIcon, setLoadingAppIcon] = useState(false);
  const [appIconUrl, setAppIconUrl] = useState<string | null>(null);

  const handleExportJSON = () => {
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "brand-assets.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDownloadAssets = async () => {
      const zip = new JSZip();
      
      // Add JSON
      zip.file("brand-identity.json", JSON.stringify(data, null, 2));
      
      // Add Main Logo
      if (data.logoUrl) {
          const logoData = data.logoUrl.split(',')[1];
          zip.file("logo-primary.png", logoData, { base64: true });
      }

      // Add App Icon if exists
      if (appIconUrl) {
          const iconData = appIconUrl.split(',')[1];
          zip.file("app-icon-variant.png", iconData, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "branding-assets.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleConceptClick = async (concept: LogoConcept) => {
      setLoadingLogo(true);
      const prompt = `Logo Design: ${concept.name}. ${concept.description}. Colors: ${concept.paletteSuggestion}. Vector graphic, flat design, white background, high quality, professional app icon.`;
      
      try {
          const newUrl = await generateLogoImage(prompt);
          if (newUrl) {
              onUpdateLogo(newUrl, prompt);
              // Reset app icon if logo changes
              setAppIconUrl(null); 
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingLogo(false);
      }
  };

  const handleGenerateAppIcon = async () => {
      setLoadingAppIcon(true);
      // Prompt specifically for a mobile app icon style based on the current logo description
      const prompt = `Mobile App Icon version of this logo: ${data.logoPrompt}. iOS style, rounded square mask implied, glossy finish, highly detailed 3D render, app store quality.`;
      
      try {
          const newUrl = await generateLogoImage(prompt);
          if (newUrl) {
              setAppIconUrl(newUrl);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingAppIcon(false);
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Visual Identity */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Colors */}
        <section className="bg-slate-850 rounded-xl p-6 border border-slate-700 relative">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-indigo-500 w-2 h-6 rounded-sm"></span>
                Color Palette
            </h3>
            <div className="flex gap-2">
                <Button onClick={handleExportJSON} variant="outline" className="text-xs px-2 py-1 h-8">
                    JSON
                </Button>
                <Button onClick={handleDownloadAssets} variant="primary" className="text-xs px-2 py-1 h-8 bg-indigo-600">
                    Download All Assets
                </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <ColorCard name="Primary" hex={data.palette.primary} />
            <ColorCard name="Secondary" hex={data.palette.secondary} />
            <ColorCard name="Accent" hex={data.palette.accent} />
            <ColorCard name="Background" hex={data.palette.background} />
            <ColorCard name="Text" hex={data.palette.text} />
          </div>
        </section>

        {/* Typography & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-slate-850 rounded-xl p-6 border border-slate-700 flex-1">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-emerald-500 w-2 h-6 rounded-sm"></span>
                Typography
            </h3>
            <div className="space-y-4">
                <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Heading Font</span>
                <p className="text-lg text-white font-medium">{data.typography.heading}</p>
                </div>
                <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Body Font</span>
                <p className="text-lg text-white font-medium">{data.typography.body}</p>
                </div>
            </div>
            </section>

            <section className="bg-slate-850 rounded-xl p-6 border border-slate-700 flex-1">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-amber-500 w-2 h-6 rounded-sm"></span>
                Brand Tone
            </h3>
            <p className="text-slate-300 leading-relaxed italic">
                "{data.tone}"
            </p>
            </section>
        </div>

        {/* Logo Concepts List */}
        <section className="bg-slate-850 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-purple-500 w-2 h-6 rounded-sm"></span>
                Alternative Logo Concepts
            </h3>
            <p className="text-sm text-slate-400 mb-4">Click any concept to generate a new primary logo based on that style.</p>
            <div className="grid gap-4">
                {data.logoConcepts?.map((concept, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => handleConceptClick(concept)}
                        disabled={loadingLogo}
                        className="bg-slate-900/50 hover:bg-slate-800 p-4 rounded-lg border border-slate-800 hover:border-indigo-500/50 transition-all text-left w-full group relative"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{concept.name}</h4>
                            <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                                {concept.paletteSuggestion}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm">{concept.description}</p>
                        {loadingLogo && <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center rounded-lg"><span className="text-indigo-400 text-xs font-bold animate-pulse">Generating...</span></div>}
                    </button>
                ))}
            </div>
        </section>
      </div>

      {/* Right Column: Logo & App Icon */}
      <div className="lg:col-span-1 space-y-8">
        {/* Primary Logo */}
        <section className="bg-slate-850 rounded-xl p-6 border border-slate-700 lg:sticky lg:top-24">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="bg-pink-500 w-2 h-6 rounded-sm"></span>
            Primary Logo
          </h3>
          
          <div className="aspect-square w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900 flex items-center justify-center relative group shadow-2xl mb-4">
            {loadingLogo ? (
                 <div className="flex flex-col items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-indigo-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-slate-400">Forging new logo...</span>
                 </div>
            ) : data.logoUrl ? (
              <>
                <img 
                  src={data.logoUrl} 
                  alt="AI Generated Logo" 
                  className="w-full h-full object-contain p-4"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                     <p className="text-xs text-white text-center line-clamp-2">{data.logoPrompt}</p>
                 </div>
              </>
            ) : (
              <div className="text-slate-500 flex flex-col items-center p-4 text-center">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>Logo generation failed.</span>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-2">Prompt Used:</h4>
            <div className="bg-slate-900 p-3 rounded text-xs text-slate-500 font-mono h-24 overflow-y-auto custom-scrollbar">
              {data.logoPrompt}
            </div>
          </div>
        </section>

        {/* App Icons Generator */}
        <section className="bg-slate-850 rounded-xl p-6 border border-slate-700">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="bg-blue-500 w-2 h-5 rounded-sm"></span>
                    App Icons
                </h3>
                <Button 
                    onClick={handleGenerateAppIcon} 
                    variant="outline" 
                    className="text-xs px-2 py-1 h-8"
                    disabled={loadingAppIcon}
                >
                    {loadingAppIcon ? 'Generating...' : 'Generate Icon Variant'}
                </Button>
             </div>

             <div className="bg-slate-900 rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] relative border border-slate-800">
                {loadingAppIcon ? (
                     <div className="flex flex-col items-center justify-center">
                        <svg className="animate-spin h-6 w-6 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                     </div>
                ) : appIconUrl ? (
                    <div className="relative group">
                         <img src={appIconUrl} className="w-24 h-24 rounded-2xl shadow-xl object-cover" alt="App Icon Variant" />
                         <div className="absolute -bottom-2 -right-2 bg-slate-800 text-xs px-2 py-0.5 rounded text-white border border-slate-600">iOS Style</div>
                    </div>
                ) : (
                    <div className="text-center text-slate-500 text-sm">
                        <p>Generate a mobile-optimized icon variant based on your branding.</p>
                    </div>
                )}
             </div>
        </section>
      </div>

    </div>
  );
};