import React, { useState } from 'react';
import { ProjectInput } from '../types';
import { Button } from './Button';

interface InputFormProps {
  onSubmit: (data: ProjectInput) => void;
  isGenerating: boolean;
}

const STYLES = [
  "Modern & Minimalist",
  "Corporate & Professional",
  "Playful & Vibrant",
  "Dark & Futuristic",
  "Luxury & Elegant",
  "Tech & Geometric"
];

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isGenerating }) => {
  const [data, setData] = useState<ProjectInput>({
    name: '',
    description: '',
    audience: '',
    style: STYLES[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-850 p-8 rounded-2xl shadow-xl border border-slate-800">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Build Your Spec</h1>
        <p className="text-slate-400">Define your idea, and let Gemini craft your PRD and Brand Identity.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="e.g., TaskMaster AI"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            value={data.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Project Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Describe your app idea in detail. What does it do? Who is it for?"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            value={data.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-1">Target Audience</label>
            <input
              type="text"
              id="audience"
              name="audience"
              required
              placeholder="e.g., Remote developers, Students"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={data.audience}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="style" className="block text-sm font-medium text-slate-300 mb-1">Visual Style</label>
            <div className="relative">
              <select
                id="style"
                name="style"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                value={data.style}
                onChange={handleChange}
              >
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            isLoading={isGenerating} 
            className="w-full text-lg py-4"
          >
            Generate Specs & Assets
          </Button>
          {isGenerating && (
            <p className="text-center text-slate-500 text-sm mt-3 animate-pulse">
              AI is analyzing your request, thinking through architecture, and designing logos...
            </p>
          )}
        </div>
      </form>
    </div>
  );
};