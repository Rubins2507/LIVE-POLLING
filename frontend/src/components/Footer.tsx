import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { BaseModal, ContactModal } from './InfoModals';

export const Footer: React.FC = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
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
              Real-time polling for a better tomorrow • Built with Go, Gin, Redis, MongoDB & WebSockets
            </div>

            {/* Links & Socials */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <button
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <button
                onClick={() => setTermsOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms
              </button>
              <button
                onClick={() => setContactOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contact
              </button>

              <div className="flex items-center gap-4 text-slate-400 ml-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <BaseModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title="LivePoll Privacy Policy"
      >
        <p>
          At LivePoll, your privacy is our top priority. We believe in transparent, anonymous participation where audience feedback is gathered without collecting invasive personal identifiers.
        </p>
        <h4 className="font-bold text-slate-800">1. Anonymous Voting</h4>
        <p>
          Participants in public polls do not need an account or email address. We use a randomly generated pseudonymous device token stored strictly in your browser&apos;s localStorage to ensure one vote per poll without tying votes to your personal identity.
        </p>
        <h4 className="font-bold text-slate-800">2. Creator Accounts</h4>
        <p>
          For poll creators, we store only your name, email address, and cryptographically hashed passwords (using bcrypt with 10 salt rounds) required for authentication and managing your polls.
        </p>
        <h4 className="font-bold text-slate-800">3. Data Retention & Security</h4>
        <p>
          Poll results, tallies, and timestamps are stored securely in MongoDB and cached in Redis. We never sell or share user or participant data with third-party advertising networks.
        </p>
      </BaseModal>

      {/* Terms of Service Modal */}
      <BaseModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="LivePoll Terms of Service"
      >
        <p>
          Welcome to LivePoll. By accessing or using our interactive polling platform, you agree to comply with and be bound by the following terms.
        </p>
        <h4 className="font-bold text-slate-800">1. Responsible Use</h4>
        <p>
          You agree not to post questions or options containing hate speech, malicious links, harassment, or unauthorized promotional spam.
        </p>
        <h4 className="font-bold text-slate-800">2. Real-Time Service Availability</h4>
        <p>
          While we strive for 99.99% uptime with Redis Pub/Sub and WebSocket clustering, real-time transmissions may occasionally be affected by local connectivity constraints.
        </p>
        <h4 className="font-bold text-slate-800">3. Ownership of Content</h4>
        <p>
          You retain full ownership of the polls, questions, and aggregate responses generated in your account. You may export or delete your polls at any time from the Dashboard.
        </p>
      </BaseModal>

      {/* Contact Support Modal */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </>
  );
};
