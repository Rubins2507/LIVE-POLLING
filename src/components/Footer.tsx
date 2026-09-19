import React from 'react';
import { Github, Twitter, Linkedin, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0b1120] text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-1 h-6 w-6">
              <span className="w-1.5 h-3 bg-blue-500 rounded-xs" />
              <span className="w-1.5 h-4.5 bg-blue-500 rounded-xs" />
              <span className="w-1.5 h-6 bg-blue-500 rounded-xs" />
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight">
              Live<span className="text-white">Poll</span>
            </span>
          </div>

          <div className="text-xs text-slate-400 text-center md:text-left">
            Real-time polling for a better tomorrow
          </div>

          {/* Links & Socials */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#contact" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
              Contact
            </a>

            <div className="flex items-center gap-4 text-slate-400 ml-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
