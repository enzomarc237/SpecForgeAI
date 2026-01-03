import React, { useState, useEffect } from 'react';
import { AppStep, GeneratedPackage, ProjectInput } from './types';
import { InputForm } from './components/InputForm';
import { PRDDisplay } from './components/PRDDisplay';
import { BrandingDisplay } from './components/BrandingDisplay';
import { generateFullPackage } from './services/geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [generatedData, setGeneratedData] = useState<GeneratedPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'prd' | 'branding'>('prd');
  const [error, setError] = useState<string | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeyReady(has);
      } else {
        if (process.env.API_KEY) {
          setApiKeyReady(true);
        }
      }
    };
    checkKey();
  }, []);

  const handleConnectApiKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setApiKeyReady(true);
    } else {
       setApiKeyReady(true);
    }
  };

  const handleSkipKey = () => {
    // User opts for free tier / default key available in env
    setApiKeyReady(true);
  }

  const handleFormSubmit = async (input: ProjectInput) => {
    setStep(AppStep.GENERATING);
    setError(null);
    try {
      const result = await generateFullPackage(input);
      setGeneratedData(result);
      setStep(AppStep.COMPLETE);
    } catch (err: any) {
      console.error("Generation error:", err);
      if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
          setError("Permission denied. You may need to select a different API key associated with a paid Google Cloud Project, or retry with the free tier.");
          setApiKeyReady(false);
      } else {
          setError("An error occurred while generating the content. Please try again.");
      }
      setStep(AppStep.INPUT);
    }
  };

  const handleReset = () => {
    setStep(AppStep.INPUT);
    setGeneratedData(null);
    setActiveTab('prd');
    setError(null);
  };

  const handleUpdateLogo = (newUrl: string, newPrompt: string) => {
      if (generatedData) {
          setGeneratedData({
              ...generatedData,
              branding: {
                  ...generatedData.branding,
                  logoUrl: newUrl,
                  logoPrompt: newPrompt
              }
          });
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">SpecForge <span className="text-indigo-500">AI</span></span>
          </div>
          {step === AppStep.COMPLETE && (
             <Button onClick={handleReset} variant="outline" className="text-sm py-1.5 px-3">
               New Project
             </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Error Message */}
        {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
            </div>
        )}

        {!apiKeyReady ? (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-2xl mx-auto">
                <div className="bg-indigo-600/10 p-4 rounded-full mb-6">
                    <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.5 17.5 14 20l-2.257 1.128a9 9 0 0011-11zm-5-3a9 9 0 00-11 11v.002a9 9 0 0011 11H21a2 2 0 002-2v-1.278a9.006 9.006 0 00-3.656-7.345 9 9 0 10-4.344-9.375V7z"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Connect Your Google Cloud Project</h2>
                <p className="text-slate-400 mb-8 text-lg">
                    SpecForge AI uses premium Gemini models (Gemini 3 Pro & Imagen) to generate high-fidelity specs and brand assets.
                    For the best experience, please select a project with billing enabled.
                </p>
                <div className="flex flex-col items-center gap-4">
                    <Button onClick={handleConnectApiKey} className="text-lg px-8 py-3 shadow-indigo-500/50">
                        Select Paid API Key
                    </Button>
                    <button 
                        onClick={handleSkipKey}
                        className="text-slate-500 hover:text-white underline text-sm transition-colors"
                    >
                        Continue with Free Tier (Standard Resolution Images)
                    </button>
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-indigo-400 hover:text-indigo-300 underline mt-4"
                    >
                        View Billing Documentation
                    </a>
                </div>
            </div>
        ) : (
            <>
                {step === AppStep.INPUT && (
                <InputForm onSubmit={handleFormSubmit} isGenerating={false} />
                )}

                {step === AppStep.GENERATING && (
                <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                    <div className="relative mb-8">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                    <svg className="w-20 h-20 text-indigo-500 animate-spin relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Forging Your Specifications</h2>
                    <p className="text-slate-400">Gemini is thinking about your architecture, defining requirements, and designing your brand identity...</p>
                </div>
                )}

                {step === AppStep.COMPLETE && generatedData && (
                <div className="space-y-8 animate-fade-in-up">
                    
                    {/* Tabs */}
                    <div className="flex justify-center border-b border-slate-800">
                    <nav className="flex gap-8 -mb-px">
                        <button
                            onClick={() => setActiveTab('prd')}
                            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === 'prd' 
                                ? 'border-indigo-500 text-indigo-400' 
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                        >
                            PRD Document
                        </button>
                        <button
                            onClick={() => setActiveTab('branding')}
                            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === 'branding' 
                                ? 'border-indigo-500 text-indigo-400' 
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                        >
                            Brand Identity
                        </button>
                    </nav>
                    </div>

                    {/* Content Render */}
                    <div className="min-h-[600px]">
                    {activeTab === 'prd' ? (
                        <PRDDisplay sections={generatedData.prd} branding={generatedData.branding} />
                    ) : (
                        <BrandingDisplay 
                            data={generatedData.branding} 
                            onUpdateLogo={handleUpdateLogo}
                        />
                    )}
                    </div>

                </div>
                )}
            </>
        )}
      </main>

    </div>
  );
};

export default App;