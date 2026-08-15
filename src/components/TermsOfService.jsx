import React from "react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 px-6">
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: August 2026</p>

        <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using MAYA ("the Service") at mayamanage.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
            <p className="mt-2">The Service is operated by MayaManage ("we", "our", "us"). We reserve the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Service Description</h2>
            <p>MAYA is an AI-powered creator operations assistant that helps users manage their social media presence across multiple platforms. The Service provides:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Social media account connectivity via Phyllo</li>
              <li>AI-generated content planning and weekly strategies</li>
              <li>Content calendar and draft management</li>
              <li>Performance insights and operational suggestions</li>
              <li>AI workflow assistant (chat-based)</li>
              <li>Platform-specific content generation tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Supported Platforms</h2>
            <p>MAYA currently supports connectivity and content operations for the following platforms through our integration partner Phyllo:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {["Instagram", "TikTok", "YouTube", "Facebook", "X (Twitter)", "Twitch", "Snapchat", "LinkedIn", "Spotify", "Substack", "Beehiiv", "AdSense", "Instagram Direct", "Instagram Lite"].map((p, i) => (
                <span key={i} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">{p}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Platform availability depends on Phyllo's API support and may change without prior notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Account Registration</h2>
            <p>To use MAYA, you must create an account by providing a valid email address and password. You are responsible for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and current information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
            <p className="mt-2">You must be at least 13 years old to use the Service, in compliance with the minimum age requirements of supported social media platforms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Connected Social Accounts</h2>
            <p>When you connect a social media account to MAYA through Phyllo:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Read-only access:</strong> MAYA only reads your public posts, captions, engagement metrics, and profile information. We cannot post, edit, or delete content on your behalf.</li>
              <li><strong>Data storage:</strong> We store your post data, captions, comments, and engagement metrics in our database to compute analytics and provide AI-powered suggestions.</li>
              <li><strong>Nightly sync:</strong> Connected accounts are refreshed automatically via a scheduled sync process.</li>
              <li><strong>Disconnect anytime:</strong> You can disconnect any social account at any time from your Account settings. Disconnecting sets the account as inactive but preserves historical data for your reference.</li>
              <li><strong>One account per user:</strong> Each social media account can only be connected to one MAYA user at a time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">6. AI-Generated Content</h2>
            <p>MAYA uses artificial intelligence (powered by OpenAI) to generate content suggestions, weekly plans, captions, hooks, and operational recommendations. Please note:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>AI-generated content is provided as suggestions only — you are responsible for reviewing, editing, and approving before use.</li>
              <li>We do not guarantee the accuracy, originality, or performance of AI-generated content.</li>
              <li>You retain full ownership and responsibility for any content you publish using MAYA's suggestions.</li>
              <li>AI responses are generated based on your connected account data and may include analysis of your post captions, comments, and engagement patterns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service to generate harmful, misleading, or abusive content</li>
              <li>Resell, sublicense, or commercially exploit the Service without permission</li>
              <li>Reverse-engineer or attempt to extract source code from the Service</li>
              <li>Use automated systems (bots, scrapers) to access the Service outside of normal use</li>
              <li>Connect social media accounts that you do not own or have authorization to manage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Intellectual Property</h2>
            <p><strong>Your content:</strong> You retain all rights to the content you create, post, or generate using MAYA. We do not claim ownership over your social media posts, captions, or creative work.</p>
            <p className="mt-2"><strong>Our platform:</strong> The MAYA platform, its design, code, AI models, branding, and documentation are the intellectual property of MayaManage. You may not copy, modify, or distribute any part of the platform without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Service Availability & Beta Status</h2>
            <p>MAYA is currently in beta. This means:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>Features may change, be added, or removed without prior notice</li>
              <li>Downtime or interruptions may occur</li>
              <li>The Service is currently free; pricing may be introduced in the future with advance notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms. You may delete your account at any time by contacting us at mayamanage007@gmail.com.</p>
            <p className="mt-2">Upon termination, your access to the Service will be revoked. We may retain your data for up to 30 days before permanent deletion, unless required by law to retain it longer.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">11. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>MayaManage shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</li>
              <li>We are not responsible for the performance of your social media content, whether or not it was generated using MAYA's suggestions.</li>
              <li>We are not responsible for any actions taken by connected social media platforms regarding your account.</li>
              <li>Our total liability shall not exceed the amount paid by you to us in the 12 months preceding the claim (currently $0 during beta).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">12. Third-Party Services</h2>
            <p>MAYA integrates with third-party services including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Phyllo:</strong> For social media account connectivity and data access</li>
              <li><strong>OpenAI:</strong> For AI-powered content generation and analytics</li>
              <li><strong>Google Cloud:</strong> For hosting and infrastructure</li>
            </ul>
            <p className="mt-2">Your use of these services through MAYA is also subject to their respective terms and privacy policies. We are not responsible for the availability or actions of third-party services.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">13. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">14. Contact</h2>
            <p>For questions or concerns about these Terms of Service, contact us at:</p>
            <p className="mt-2 font-medium">mayamanage007@gmail.com</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MayaManage · Bangalore, India</p>
          </section>

        </div>
      </div>
    </div>
  );
}
