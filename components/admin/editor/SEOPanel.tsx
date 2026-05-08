import React, { useEffect, useState } from 'react';
import { TechPanel } from '../../ui/TechPanel';
import { AlertCircle, CheckCircle, Smartphone, Monitor, Code, FileJson, Copy } from 'lucide-react';

interface SEOProps {
  title: string;
  content: string; // HTML content
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  slug: string;
  image?: string;
  author?: string;
  datePublished?: string;
  onChange: (field: string, value: string) => void;
}

interface SEOAnalysis {
  score: number;
  checks: {
    label: string;
    status: 'good' | 'warning' | 'bad';
    message: string;
  }[];
}

export const SEOPanel: React.FC<SEOProps> = ({
  title,
  content,
  metaTitle,
  metaDescription,
  focusKeyword,
  slug,
  image,
  author,
  datePublished,
  onChange
}) => {
  const [analysis, setAnalysis] = useState<SEOAnalysis>({ score: 0, checks: [] });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'analysis' | 'schema'>('analysis');
  const [schemaType, setSchemaType] = useState('BlogPosting');

  useEffect(() => {
    analyzeSEO();
  }, [title, content, metaTitle, metaDescription, focusKeyword]);

  const generateSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "headline": metaTitle || title,
      "description": metaDescription,
      "image": image ? [image] : [],
      "datePublished": datePublished || new Date().toISOString(),
      "author": [{
          "@type": "Person",
          "name": author || "TaskForce Team"
      }],
      "url": `https://taskforce.ai/blog/${slug}`
    };
    return JSON.stringify(schema, null, 2);
  };

  const analyzeSEO = () => {
    const checks: SEOAnalysis['checks'] = [];
    let passedChecks = 0;
    let totalChecks = 0;

    const addCheck = (label: string, condition: boolean, goodMsg: string, badMsg: string) => {
      totalChecks++;
      if (condition) {
        passedChecks++;
        checks.push({ label, status: 'good', message: goodMsg });
      } else {
        checks.push({ label, status: 'bad', message: badMsg });
      }
    };

    // 1. Focus Keyword presence
    const keyword = focusKeyword.toLowerCase();
    const hasKeyword = keyword.length > 0;
    
    if (hasKeyword) {
      addCheck(
        "Focus Keyword", 
        true, 
        "Focus keyword set.", 
        "Please set a focus keyword."
      );
      
      const titleHasKeyword = (metaTitle || title).toLowerCase().includes(keyword);
      addCheck(
        "Keyword in Title", 
        titleHasKeyword, 
        "Keyword appears in SEO title.", 
        "Keyword missing from SEO title."
      );

      const descHasKeyword = metaDescription.toLowerCase().includes(keyword);
      addCheck(
        "Keyword in Description", 
        descHasKeyword, 
        "Keyword appears in meta description.", 
        "Keyword missing from meta description."
      );

      // Strip HTML for content check
      const textContent = content.replace(/<[^>]*>/g, '').toLowerCase();
      const contentHasKeyword = textContent.includes(keyword);
      addCheck(
        "Keyword in Content", 
        contentHasKeyword, 
        "Keyword appears in content.", 
        "Keyword missing from content."
      );
    } else {
       checks.push({ label: "Focus Keyword", status: 'warning', message: "Set a focus keyword to enable analysis." });
    }

    // 2. Length checks
    const titleLength = (metaTitle || title).length;
    addCheck(
      "SEO Title Length",
      titleLength >= 30 && titleLength <= 60,
      "Good title length.",
      `Title is ${titleLength} chars (recommended: 30-60).`
    );

    const descLength = metaDescription.length;
    addCheck(
      "Meta Description Length",
      descLength >= 120 && descLength <= 160,
      "Good description length.",
      `Description is ${descLength} chars (recommended: 120-160).`
    );

    const wordCount = content.split(/\s+/).length;
    addCheck(
      "Content Length",
      wordCount >= 300,
      `Good content length (${wordCount} words).`,
      `Content is too short (${wordCount} words). Recommended: 300+.`
    );

    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
    setAnalysis({ score, checks });
  };

  return (
    <div className="space-y-6">
      <TechPanel className="p-6 bg-black/20">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
           <h3 className="text-xl font-bold text-white">SEO Optimization</h3>
           <div className="flex bg-white/5 rounded p-1">
             <button
               onClick={() => setActiveTab('analysis')}
               className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'analysis' ? 'bg-primary-DEFAULT text-black' : 'text-gray-400 hover:text-white'}`}
             >
               Analysis
             </button>
             <button
               onClick={() => setActiveTab('schema')}
               className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'schema' ? 'bg-primary-DEFAULT text-black' : 'text-gray-400 hover:text-white'}`}
             >
               Schema.org
             </button>
           </div>
        </div>
        
        {activeTab === 'analysis' ? (
          <>
            {/* Score Indicator */}
            <div className="flex items-center justify-between mb-6">
              <div>
                 <div className="text-4xl font-bold font-mono" style={{ 
                   color: analysis.score > 80 ? '#22c55e' : analysis.score > 50 ? '#eab308' : '#ef4444' 
                 }}>
                   {analysis.score}/100
                 </div>
                 <div className="text-xs text-gray-400">SEO Score</div>
              </div>
              <div className="text-right">
                 <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Focus Keyword</label>
                 <input 
                   type="text" 
                   value={focusKeyword}
                   onChange={(e) => onChange('focusKeyword', e.target.value)}
                   className="bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-white focus:border-primary-DEFAULT focus:outline-none w-48"
                   placeholder="e.g. AI Agents"
                 />
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-gray-400 mb-1">SEO Title</label>
                <input 
                  type="text" 
                  value={metaTitle}
                  onChange={(e) => onChange('metaTitle', e.target.value)}
                  placeholder={title}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-DEFAULT focus:outline-none"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Recommended: 60 characters</span>
                  <span className={`text-xs ${(metaTitle || title).length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                    {(metaTitle || title).length}/60
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Meta Description</label>
                <textarea 
                  value={metaDescription}
                  onChange={(e) => onChange('metaDescription', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-DEFAULT focus:outline-none"
                />
                <div className="flex justify-between mt-1">
                   <span className="text-xs text-gray-500">Recommended: 160 characters</span>
                   <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                     {metaDescription.length}/160
                   </span>
                </div>
              </div>
            </div>

            {/* SERP Preview */}
            <div className="border-t border-white/10 pt-6 mb-6">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="text-sm font-bold text-white">Google Snippet Preview</h4>
                 <div className="flex bg-white/5 rounded p-1 gap-1">
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                 </div>
               </div>
               
               <div className={`bg-white rounded-lg p-4 font-sans ${previewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[600px]'}`}>
                  <div className="flex items-center gap-2 mb-1">
                     <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-500 border border-gray-200">
                        L
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs text-[#202124]">taskforce.ai</span>
                        <span className="text-xs text-[#5f6368]">https://taskforce.ai › blog › {slug || title.toLowerCase().replace(/\s+/g, '-')}</span>
                     </div>
                  </div>
                  <div className="text-[#1a0dab] text-xl font-medium cursor-pointer hover:underline truncate">
                    {metaTitle || title || "Untitled Post"}
                  </div>
                  <div className="text-[#4d5156] text-sm mt-1 line-clamp-2">
                    {metaDescription || "No description provided. Google will generate a snippet from the page content."}
                  </div>
               </div>
            </div>

            {/* Analysis List */}
            <div className="border-t border-white/10 pt-6">
               <h4 className="text-sm font-bold text-white mb-4">SEO Analysis</h4>
               <div className="space-y-3">
                 {analysis.checks.map((check, i) => (
                   <div key={i} className="flex items-start gap-3">
                     {check.status === 'good' && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                     {check.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />}
                     {check.status === 'bad' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
                     <div>
                       <div className="text-sm text-white font-medium">{check.label}</div>
                       <div className="text-xs text-gray-400">{check.message}</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
               <FileJson className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
               <div>
                 <h4 className="text-sm font-bold text-blue-400">Structured Data (JSON-LD)</h4>
                 <p className="text-xs text-gray-300 mt-1">
                   This data helps search engines understand your content better. It will be automatically injected into the page head.
                 </p>
               </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Schema Type</label>
              <select 
                value={schemaType}
                onChange={(e) => setSchemaType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-DEFAULT focus:outline-none"
              >
                <option value="BlogPosting" className="bg-black">BlogPosting (Default)</option>
                <option value="Article" className="bg-black">Article</option>
                <option value="NewsArticle" className="bg-black">NewsArticle</option>
                <option value="TechArticle" className="bg-black">TechArticle</option>
              </select>
            </div>

            <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="text-sm text-gray-400">Preview</label>
                 <button 
                   onClick={() => navigator.clipboard.writeText(generateSchema())}
                   className="text-xs text-primary-light hover:text-white flex items-center gap-1"
                 >
                   <Copy className="w-3 h-3" /> Copy JSON
                 </button>
               </div>
               <pre className="bg-black/40 p-4 rounded-lg text-xs font-mono text-gray-300 overflow-x-auto border border-white/5">
                 {generateSchema()}
               </pre>
            </div>
          </div>
        )}

      </TechPanel>
    </div>
  );
};
