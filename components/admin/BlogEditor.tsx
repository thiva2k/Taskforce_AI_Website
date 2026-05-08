import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import axios from 'axios';
import { TechPanel } from '../ui/TechPanel';
import { GlitchButton } from '../ui/GlitchButton';
import { ArrowLeft, Upload, Save, Loader2, Image as ImageIcon, Eye, Clock, History, RotateCcw, X } from 'lucide-react';
import { RichTextEditor } from './editor/RichTextEditor';
import { SEOPanel } from './editor/SEOPanel';
import { SettingsPanel } from './editor/SettingsPanel';

const CATEGORIES = ["Engineering", "Case Study", "Strategy", "Thought Leadership", "Report"];

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published';
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
}

const initialData: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  category: 'Engineering',
  tags: [],
  author: '',
  status: 'draft',
  metaTitle: '',
  metaDescription: '',
  focusKeyword: ''
};

export const BlogEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<BlogFormData>(initialData);

  // Auto-save timer
  useEffect(() => {
    if (!isEditing) return; // Only auto-save existing docs to avoid creating dupes
    
    const timer = setInterval(() => {
      if (lastSaved && new Date().getTime() - lastSaved.getTime() < 5000) return; // Skip if just saved
      handleAutoSave();
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [formData, isEditing, lastSaved]);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    if (showHistory && isEditing) {
        fetchVersions();
    }
  }, [showHistory, isEditing]);

  const fetchVersions = async () => {
      if (!id) return;
      try {
          const q = query(collection(db, 'posts', id, 'versions'), orderBy('updatedAt', 'desc'), limit(20));
          const querySnapshot = await getDocs(q);
          const fetchedVersions = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              updatedAt: doc.data().updatedAt?.toDate()
          }));
          setVersions(fetchedVersions);
      } catch (error) {
          console.error("Error fetching versions:", error);
      }
  };

  const restoreVersion = (version: any) => {
      if (window.confirm("Are you sure you want to restore this version? Current unsaved changes will be lost.")) {
          setFormData({
              title: version.title || '',
              slug: version.slug || '',
              excerpt: version.excerpt || '',
              content: version.content || '',
              image: version.image || '',
              category: version.category || 'Engineering',
              tags: version.tags || [],
              author: version.author || '',
              status: version.status || 'draft',
              metaTitle: version.seo?.metaTitle || '',
              metaDescription: version.seo?.metaDescription || '',
              focusKeyword: version.seo?.focusKeyword || ''
          });
          setShowHistory(false);
      }
  };

  const fetchPost = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'posts', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
            title: data.title || '',
            slug: data.slug || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            image: data.image || '',
            category: data.category || 'Engineering',
            tags: data.tags || [],
            author: data.author || '',
            status: data.status || 'draft',
            metaTitle: data.seo?.metaTitle || '',
            metaDescription: data.seo?.metaDescription || '',
            focusKeyword: data.seo?.focusKeyword || ''
        });
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!id) return;
    console.log("Auto-saving...");
    try {
        const docRef = doc(db, 'posts', id);
        await updateDoc(docRef, {
            ...mapDataToFirestore(formData),
            updatedAt: serverTimestamp()
        });
        setLastSaved(new Date());
    } catch (err) {
        console.error("Auto-save failed", err);
    }
  };

  const mapDataToFirestore = (data: BlogFormData) => ({
      title: data.title,
      slug: data.slug || createSlug(data.title),
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      category: data.category,
      tags: data.tags,
      author: data.author,
      status: data.status,
      seo: {
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          focusKeyword: data.focusKeyword
      }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const firestoreData = {
          ...mapDataToFirestore(formData),
          updatedAt: serverTimestamp()
      };

      if (isEditing && id) {
        const docRef = doc(db, 'posts', id);
        await updateDoc(docRef, firestoreData);
        
        // Save version history
        await addDoc(collection(db, 'posts', id, 'versions'), {
            ...firestoreData,
            versionLabel: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'posts'), {
            ...firestoreData,
            createdAt: serverTimestamp()
        });
      }
      setLastSaved(new Date());
      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        uploadData
      );
      
      setFormData(prev => ({ ...prev, image: response.data.secure_url }));
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-DEFAULT" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
             <h1 className="text-2xl font-bold text-white">
               {isEditing ? 'Edit Post' : 'New Post'}
             </h1>
             {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                   <Clock className="w-3 h-3" />
                   Last saved: {lastSaved.toLocaleTimeString()}
                </div>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing && (
             <GlitchButton variant="outline" onClick={() => setShowHistory(true)}>
               <History className="w-4 h-4 mr-2" />
               History
             </GlitchButton>
          )}
          <GlitchButton variant="outline" onClick={() => window.open(`/blog/preview`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </GlitchButton>
          <GlitchButton onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </GlitchButton>
        </div>
      </div>

      {/* History Slide-over */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
           <div className="relative w-full max-w-md bg-[#0A0A0A] border-l border-white/10 h-full overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <History className="w-5 h-5" /> Version History
                 </h3>
                 <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-4">
                 {versions.length === 0 ? (
                   <div className="text-center text-gray-500 py-8">No versions found.</div>
                 ) : (
                   versions.map((version) => (
                     <div key={version.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary-DEFAULT/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <div className="text-sm font-bold text-white">
                                {version.updatedAt ? version.updatedAt.toLocaleString() : 'Unknown Date'}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {version.title}
                              </div>
                           </div>
                           <button 
                             onClick={() => restoreVersion(version)}
                             className="text-primary-light hover:text-primary-DEFAULT transition-colors"
                             title="Restore this version"
                           >
                             <RotateCcw className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {version.excerpt || "No excerpt"}
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Title & Image */}
          <TechPanel className="p-6 bg-black/20">
             <input
               type="text"
               value={formData.title}
               onChange={(e) => {
                 const title = e.target.value;
                 setFormData(prev => ({
                   ...prev,
                   title,
                   slug: !isEditing ? createSlug(title) : prev.slug
                 }));
               }}
               placeholder="Enter post title..."
               className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-600 border-none focus:ring-0 mb-6"
             />

             {/* Featured Image */}
             <div className="relative group rounded-xl overflow-hidden bg-black/40 border-2 border-dashed border-white/10 min-h-[200px] flex items-center justify-center transition-colors hover:border-primary-DEFAULT/50">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Featured" className="w-full h-full object-cover max-h-[400px]" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors">
                         <Upload className="w-4 h-4" /> Change Image
                         <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                       </label>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-3 text-gray-500 hover:text-primary-light transition-colors p-8">
                     {uploading ? (
                       <Loader2 className="w-8 h-8 animate-spin" />
                     ) : (
                       <ImageIcon className="w-10 h-10" />
                     )}
                     <span className="text-sm font-medium">Click to upload featured image</span>
                     <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                )}
             </div>
          </TechPanel>

          {/* Editor */}
          <RichTextEditor 
            content={formData.content} 
            onChange={(content) => handleChange('content', content)} 
          />

          {/* SEO Panel */}
          <SEOPanel 
             title={formData.title}
             content={formData.content}
             metaTitle={formData.metaTitle}
             metaDescription={formData.metaDescription}
             focusKeyword={formData.focusKeyword}
             slug={formData.slug}
             image={formData.image}
             author={formData.author}
             datePublished={lastSaved?.toISOString()}
             onChange={handleChange}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <SettingsPanel 
             slug={formData.slug}
             category={formData.category}
             tags={formData.tags}
             author={formData.author}
             status={formData.status}
             onChange={handleChange}
             categories={CATEGORIES}
           />
           
           {/* Excerpt */}
           <TechPanel className="p-6 bg-black/20">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Excerpt</h3>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary-DEFAULT focus:outline-none"
                placeholder="Short summary for cards..."
              />
           </TechPanel>
        </div>

      </div>
    </div>
  );
};
