import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { getPost } from "../lib/api";
import { NewsletterSection } from "../components/shared";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  useEffect(() => { getPost(id).then(setPost).catch(() => setPost(false)); }, [id]);

  if (post === false) return <div className="pt-40 pb-40 text-center text-storm-silver/60">Post not found. <Link to="/news" className="text-storm-blue">Back to news</Link></div>;
  if (!post) return <div className="pt-40 pb-40 text-center text-storm-silver/50">Loading...</div>;

  const share = (net) => {
    const url = window.location.href;
    if (net === "copy") { navigator.clipboard.writeText(url); toast.success("Link copied"); return; }
    const map = { facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}` };
    window.open(map[net], "_blank");
  };

  return (
    <div>
      <article className="pt-28 max-w-3xl mx-auto px-6">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-storm-silver/60 hover:text-white mb-8"><ArrowLeft className="w-4 h-4" /> News</Link>
        <div className="flex items-center gap-3 text-xs mb-4">
          <span className="text-storm-blue/80 uppercase tracking-widest">{post.category}</span>
          <span className="text-storm-silver/40">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight" data-testid="post-title">{post.title}</h1>
        <img src={post.image} alt={post.title} className="w-full aspect-video object-cover rounded-2xl mt-8 border border-white/10" />
        <p className="text-storm-silver/80 text-lg leading-relaxed font-light mt-8">{post.preview}</p>
        <p className="text-storm-silver/80 text-lg leading-relaxed font-light mt-4">{post.content}</p>
        <div className="mt-10 flex items-center gap-3">
          <span className="text-xs text-storm-silver/50">Share:</span>
          <button onClick={() => share("facebook")} data-testid="post-share-facebook" className="text-storm-silver/60 hover:text-white"><Facebook className="w-4 h-4" /></button>
          <button onClick={() => share("twitter")} data-testid="post-share-twitter" className="text-storm-silver/60 hover:text-white"><Twitter className="w-4 h-4" /></button>
          <button onClick={() => share("copy")} data-testid="post-share-copy" className="text-storm-silver/60 hover:text-white"><LinkIcon className="w-4 h-4" /></button>
        </div>
      </article>
      <div className="mt-20"><NewsletterSection /></div>
    </div>
  );
}
