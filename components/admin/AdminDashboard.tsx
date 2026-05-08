import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { TechPanel } from '../ui/TechPanel';
import { GlitchButton } from '../ui/GlitchButton';
import { 
  Plus, Trash2, Edit2, LogOut, FileText, 
  Search, Filter, BarChart2, LayoutGrid, List as ListIcon,
  Calendar, User, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';

interface Post {
  id: string;
  slug?: string;
  title: string;
  category: string;
  date: string;
  author: string;
  image?: string;
}

const CATEGORIES = ["All", "Engineering", "Case Study", "Strategy", "Thought Leadership", "Report"];

export const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPosts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedPosts.push({
          id: doc.id,
          slug: data.slug,
          title: data.title,
          category: data.category,
          date: data.date,
          author: data.author,
          image: data.image
        });
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'posts', id));
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats Logic
  const totalPosts = posts.length;
  const categoriesCount = new Set(posts.map(p => p.category)).size;
  const latestPostDate = posts.length > 0 ? posts[0].date : "N/A";

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-dark-bg selection:bg-primary-DEFAULT selection:text-white">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="px-2 py-1 rounded bg-primary-DEFAULT/10 border border-primary-DEFAULT/20 text-xs font-mono text-primary-light">
                  ADMINISTRATOR ACCESS
               </div>
               <span className="text-xs text-gray-500 font-mono">V.2.0.4</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-1">Mission Control</h1>
            <p className="text-gray-400">Manage intelligence transmissions and system logs.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> 
              <span className="hidden sm:inline">Logout</span>
            </button>
            <GlitchButton onClick={() => navigate('/admin/new')}>
              <Plus className="w-4 h-4 mr-2" /> New Transmission
            </GlitchButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <TechPanel className="p-6 bg-[#0F1115]/50" animateScan={false}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">Total Transmissions</span>
                    <FileText className="w-4 h-4 text-primary-light" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{totalPosts}</div>
                <div className="text-xs text-gray-500">Active intelligence reports</div>
            </TechPanel>

            <TechPanel className="p-6 bg-[#0F1115]/50" animateScan={false}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">Active Categories</span>
                    <Filter className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{categoriesCount}</div>
                <div className="text-xs text-gray-500">Topics covered</div>
            </TechPanel>

            <TechPanel className="p-6 bg-[#0F1115]/50" animateScan={false}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">Latest Update</span>
                    <Calendar className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{latestPostDate}</div>
                <div className="text-xs text-gray-500">Last transmission sent</div>
            </TechPanel>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search transmissions by title or author..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 transition-all"
                />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-DEFAULT/50 transition-all appearance-none cursor-pointer min-w-[150px]"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-[#0F1115]">{cat}</option>
                    ))}
                </select>

                <div className="flex bg-black/20 border border-white/10 rounded-lg p-1">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        <ListIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-DEFAULT border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-mono text-sm animate-pulse">Accessing Secure Archives...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <TechPanel className="p-12 flex flex-col items-center justify-center text-center bg-[#0F1115]/50 border-dashed border-white/10" animateScan={false}>
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Transmissions Found</h3>
            <p className="text-gray-400 max-w-md mb-6">
                {searchQuery 
                    ? `No results found for "${searchQuery}". Try adjusting your search parameters.` 
                    : "The archives are empty. Initialize your first intelligence report."}
            </p>
            <GlitchButton onClick={() => navigate('/admin/new')}>
              Initialize Report
            </GlitchButton>
          </TechPanel>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
            <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => (
                <motion.div 
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    {viewMode === 'grid' ? (
                        <TechPanel className="h-full p-0 overflow-hidden bg-[#0F1115]/80 hover:border-primary-DEFAULT/50 transition-all group" animateScan={false}>
                            <div className="h-32 w-full bg-white/5 relative overflow-hidden">
                                {post.image && (
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 rounded bg-black/50 backdrop-blur text-[10px] font-mono text-white border border-white/10">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-light transition-colors">{post.title}</h3>
                                <div className="flex items-center justify-between text-xs text-gray-500 font-mono mb-4">
                                    <span>{post.date}</span>
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                    <button 
                                        onClick={() => navigate(`/admin/edit/${post.id}`)}
                                        className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        className="py-2 px-3 rounded bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </TechPanel>
                    ) : (
                        <div className="group flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl bg-[#0F1115]/60 border border-white/5 hover:border-primary-DEFAULT/30 hover:bg-[#0F1115] transition-all">
                             {/* Icon/Image Placeholder */}
                            <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden relative">
                                {post.image ? (
                                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <h3 className="text-white font-medium truncate group-hover:text-primary-light transition-colors">{post.title}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400">
                                    {post.category}
                                </span>
                                
                                <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate(`/blog/${post.slug || post.id}`)}
                                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                                        title="View Live"
                                        
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/admin/edit/${post.id}`)}
                                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
