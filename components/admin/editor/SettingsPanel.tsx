import React from 'react';
import { TechPanel } from '../../ui/TechPanel';
import { Tag, Calendar, User, Folder, Globe, X, Check } from 'lucide-react';

interface SettingsProps {
  slug: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published';
  onChange: (field: string, value: any) => void;
  categories: string[];
}

export const SettingsPanel: React.FC<SettingsProps> = ({
  slug,
  category,
  tags,
  author,
  status,
  onChange,
  categories
}) => {
  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        onChange('tags', [...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange('tags', tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <TechPanel className="p-6 bg-black/20 h-full">
      <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Post Settings</h3>

      <div className="space-y-6">
        {/* Status */}
        <div>
           <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Publish Status</label>
           <div className="flex bg-white/5 rounded p-1">
              <button
                onClick={() => onChange('status', 'draft')}
                className={`flex-1 py-2 text-sm font-medium rounded transition-all ${
                  status === 'draft' 
                    ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => onChange('status', 'published')}
                className={`flex-1 py-2 text-sm font-medium rounded transition-all ${
                  status === 'published' 
                    ? 'bg-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Published
              </button>
           </div>
        </div>

        {/* Slug */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-2">
            <Globe className="w-3 h-3" /> URL Slug
          </label>
          <div className="relative group">
            <input 
              type="text" 
              value={slug}
              onChange={(e) => onChange('slug', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary-DEFAULT focus:outline-none font-mono pl-8"
            />
            <div className="absolute left-3 top-2.5 text-gray-500">/</div>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            https://aitaskforce.com/blog/{slug || '...'}
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-2">
            <Folder className="w-3 h-3" /> Category
          </label>
          <div className="relative">
            <select 
              value={category}
              onChange={(e) => onChange('category', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary-DEFAULT focus:outline-none appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#0A0A0A] text-white py-2">{cat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Author */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-2">
            <User className="w-3 h-3" /> Author
          </label>
          <input 
            type="text" 
            value={author}
            onChange={(e) => onChange('author', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary-DEFAULT focus:outline-none"
            placeholder="e.g. John Doe"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-2">
            <Tag className="w-3 h-3" /> Tags
          </label>
          <div className="bg-white/5 border border-white/10 rounded px-3 py-2 min-h-[100px] flex flex-col">
             <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-primary-DEFAULT/20 text-primary-light text-xs px-2 py-1 rounded-md border border-primary-DEFAULT/30">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
             </div>
             <input
               type="text"
               value={tagInput}
               onChange={(e) => setTagInput(e.target.value)}
               onKeyDown={handleAddTag}
               className="bg-transparent border-none text-sm text-white focus:ring-0 p-0 placeholder-gray-600 mt-auto"
               placeholder="Type and press Enter..."
             />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Press Enter to add a tag</p>
        </div>
      </div>
    </TechPanel>
  );
};
