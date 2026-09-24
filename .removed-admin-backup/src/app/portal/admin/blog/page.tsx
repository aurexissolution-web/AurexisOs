"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import {
  PenTool,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Calendar,
  Tag,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
}

const inputClass =
  "w-full bg-[#02040A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00F0FF] transition-colors placeholder:text-[#64748B]";

export default function BlogEnginePage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editorForm, setEditorForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    published: false,
    cover_image: "",
  });

  const loadPosts = useCallback(async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, tags, published, cover_image, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as BlogPostItem[]);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function openNew() {
    setEditingId(null);
    setEditorForm({ title: "", slug: "", excerpt: "", content: "", tags: "", published: false, cover_image: "" });
    setShowEditor(true);
  }

  function openEdit(post: BlogPostItem) {
    setEditingId(post.id);
    setEditorForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content || "",
      tags: post.tags.join(", "),
      published: post.published,
      cover_image: post.cover_image || "",
    });
    setShowEditor(true);
  }

  async function handleSave() {
    const payload = {
      title: editorForm.title,
      slug: editorForm.slug,
      excerpt: editorForm.excerpt,
      content: editorForm.content,
      tags: editorForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      published: editorForm.published,
      cover_image: editorForm.cover_image || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from("blog_posts").update(payload).eq("id", editingId);
    } else {
      await supabase.from("blog_posts").insert(payload);
    }
    setShowEditor(false);
    loadPosts();
  }

  async function handleDelete(id: string) {
    await supabase.from("blog_posts").delete().eq("id", id);
    loadPosts();
  }

  async function togglePublish(id: string) {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    await supabase.from("blog_posts").update({ published: !post.published }).eq("id", id);
    loadPosts();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from("blog-images").upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from("blog-images").getPublicUrl(fileName);

      setEditorForm((prev) => ({
        ...prev,
        cover_image: publicUrlData.publicUrl,
      }));
    } catch (err: unknown) {
      console.error("Upload error:", err);
      alert("Failed to upload image: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage() {
    setEditorForm((prev) => ({ ...prev, cover_image: "" }));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Blog Engine</h1>
          <p className="text-sm text-[#94A3B8]">Create, edit, and publish Aurexis Intel articles.</p>
        </div>
        <NeonButton onClick={openNew} className="!px-5 !py-2.5 !text-sm">
          <Plus className="w-4 h-4 mr-2" /> New Post
        </NeonButton>
      </motion.div>

      {/* Editor modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <GlassCard className="!border-[#00F0FF]/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-[#00F0FF]" />
                    {editingId ? "Edit Post" : "New Post"}
                  </h2>
                  <button onClick={() => setShowEditor(false)} className="text-[#94A3B8] hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Title</label>
                    <input
                      className={inputClass}
                      placeholder="Post title"
                      value={editorForm.title}
                      onChange={(e) => setEditorForm({ ...editorForm, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Slug</label>
                    <input
                      className={inputClass}
                      placeholder="post-url-slug"
                      value={editorForm.slug}
                      onChange={(e) => setEditorForm({ ...editorForm, slug: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Excerpt</label>
                    <textarea
                      rows={2}
                      className={inputClass + " resize-none"}
                      placeholder="Short summary..."
                      value={editorForm.excerpt}
                      onChange={(e) => setEditorForm({ ...editorForm, excerpt: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Content (Markdown)</label>
                    <textarea
                      rows={6}
                      className={inputClass + " resize-none font-mono text-xs"}
                      placeholder="Write your article in Markdown..."
                      value={editorForm.content}
                      onChange={(e) => setEditorForm({ ...editorForm, content: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Tags (comma-separated)</label>
                    <input
                      className={inputClass}
                      placeholder="AI, Next.js, Supabase"
                      value={editorForm.tags}
                      onChange={(e) => setEditorForm({ ...editorForm, tags: e.target.value })}
                    />
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Cover Image</label>
                    {editorForm.cover_image ? (
                      <div className="relative w-full h-40 rounded-lg border border-white/10 overflow-hidden group mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={editorForm.cover_image} alt="Cover" className="w-full h-full object-cover" />
                        <button type="button" onClick={removeImage} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-6 h-6 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-[#00F0FF]/30 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${isUploading ? "text-[#00F0FF] animate-pulse" : "text-[#64748B]"}`} />
                        <p className="text-xs text-[#64748B]">{isUploading ? "Uploading..." : "Click or drag to upload cover image"}</p>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorForm.published}
                      onChange={(e) => setEditorForm({ ...editorForm, published: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 bg-[#02040A] text-[#00F0FF] focus:ring-[#00F0FF]"
                    />
                    <span className="text-sm text-[#94A3B8]">Publish immediately</span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <NeonButton onClick={handleSave} className="!px-6 !py-3 !text-sm">
                      <Save className="w-4 h-4 mr-2" /> {editingId ? "Update" : "Create"} Post
                    </NeonButton>
                    <NeonButton variant="ghost" onClick={() => setShowEditor(false)} className="!text-sm">
                      Cancel
                    </NeonButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post list */}
      <div className="space-y-3">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
          >
            <GlassCard className="!p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                  <PenTool className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{post.title}</h3>
                    {post.published ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] font-medium">Published</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#64748B]/15 text-[#64748B] font-medium">Draft</span>
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8] line-clamp-1 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
                      <Calendar className="w-3 h-3" /> {post.updated_at}
                    </div>
                    <div className="flex gap-1">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#94A3B8] flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublish(post.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-[#94A3B8] hover:text-white transition-colors"
                    title={post.published ? "Unpublish" : "Publish"}
                  >
                    {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 rounded-lg hover:bg-white/5 text-[#94A3B8] hover:text-[#00F0FF] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[#94A3B8] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
