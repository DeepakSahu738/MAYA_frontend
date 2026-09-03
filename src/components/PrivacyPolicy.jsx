import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 px-6">
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: August 2026</p>

        <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Introduction</h2>
            <p>MayaManage ("we", "our", "us") operates the MAYA platform at mayamanage.com. This Privacy Policy explains how we collect, use, store, and protect your information when you use our Service.</p>
            <p className="mt-2">By using MAYA, you consent to the practices described in this policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Information We Collect</h2>

            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">2.1 Account Information</h3>
            <p>When you register, we collect:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>First name, last name, username</li>
              <li>Email address</li>
              <li>Password (stored as a secure hash — we never store plain-text passwords)</li>
            </ul>

            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">2.2 Social Media Data (via Phyllo)</h3>
            <p>When you connect a social media account, we receive and store:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Profile information (username, follower count, bio, profile picture URL)</li>
              <li>Post content (captions, media type, timestamps)</li>
              <li>Engagement metrics (likes, comments, saves, shares, views)</li>
              <li>Comments on your posts (text, username, likes received)</li>
              <li>Hashtag usage and performance</li>
            </ul>
            <p className="mt-2">This data is fetched through Phyllo's API and stored in our database for analytics computation and AI-powered recommendations.</p>

            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">2.3 AI Conversation Data</h3>
            <p>When you use the AI chat feature, your messages and MAYA's responses are processed by OpenAI. Conversation context may include references to your post captions, engagement patterns, and scheduling data to provide personalized answers.</p>

            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">2.4 Usage Data</h3>
            <p>We may collect:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Pages visited and features used</li>
              <li>Browser type and device information</li>
              <li>Timestamps of activity</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Note: No third-party analytics tracking (Google Analytics, etc.) is currently implemented on the frontend.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and operate the MAYA Service</li>
              <li>Generate personalized content plans and strategies</li>
              <li>Compute performance analytics and insights</li>
              <li>Power the AI chat assistant with relevant context</li>
              <li>Manage your content calendar and scheduled drafts</li>
              <li>Send service-related notifications (if enabled)</li>
              <li>Improve and develop new features</li>
              <li>Respond to support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Third-Party Services</h2>
            <p>We share data with the following third-party services:</p>

            <div className="mt-3 space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">Phyllo</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Provides social media account connectivity. Receives your OAuth authorization to fetch your social media data. Subject to Phyllo's privacy policy.</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">OpenAI</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Processes AI chat messages and content generation requests. Your post captions, comments, and engagement data may be included in prompts sent to OpenAI for personalized responses.</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">Google Cloud Platform</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hosts our backend infrastructure (Cloud Run, asia-southeast1 region). Processes and stores data on Google's secure infrastructure.</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">Aiven (PostgreSQL)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cloud-hosted database where your account data, posts, comments, and analytics are stored.</p>
              </div>
            </div>

            <p className="mt-3">We do not sell your data to advertisers or any other third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Supported Platforms</h2>
            <p>Data may be collected from the following platforms when you connect them:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {["Instagram", "TikTok", "YouTube", "Facebook", "X (Twitter)", "Twitch", "Snapchat", "LinkedIn", "Spotify", "Substack", "Beehiiv", "AdSense", "Instagram Direct", "Instagram Lite"].map((p, i) => (
                <span key={i} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">{p}</span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Data Storage & Security</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Storage location:</strong> Google Cloud (asia-southeast1) and Aiven cloud PostgreSQL</li>
              <li><strong>Encryption:</strong> Data is encrypted in transit (HTTPS/TLS). Database connections use SSL.</li>
              <li><strong>Authentication:</strong> JWT-based authentication. Passwords are bcrypt-hashed. No plain-text credentials are stored.</li>
              <li><strong>Access control:</strong> Social media data is isolated per user. You can only access your own connected accounts' data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Data Retention & Deletion</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Active accounts:</strong> Data is retained as long as your account is active and social accounts are connected.</li>
              <li><strong>Disconnected accounts:</strong> When you disconnect a social account, the connection is deactivated but historical data is preserved for your reference. You can request full deletion.</li>
              <li><strong>Account deletion:</strong> Contact us at mayamanage007@gmail.com to request account deletion. We will delete your data within 30 days of the request.</li>
              <li><strong>Nightly sync:</strong> Connected accounts are refreshed daily. Only active connections are synced.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access:</strong> View all data we have collected about you through your MAYA dashboard</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate personal information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Disconnect:</strong> Remove any connected social media account at any time</li>
              <li><strong>Portability:</strong> Request an export of your data in a standard format</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at mayamanage007@gmail.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Cookies & Local Storage</h2>
            <p>MAYA does not use tracking cookies. We use:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Session Storage:</strong> JWT authentication token (cleared when browser tab closes)</li>
              <li><strong>Local Storage:</strong> Theme preference (dark/light mode), onboarding completion status, and UI preferences</li>
            </ul>
            <p className="mt-2">No third-party cookies or advertising trackers are placed on your device.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Children's Privacy</h2>
            <p>MAYA is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete that information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Service. Your continued use of MAYA after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">12. Contact</h2>
            <p>For privacy-related questions or data requests, contact us at:</p>
            <p className="mt-2 font-medium">mayamanage007@gmail.com</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MayaManage · Bangalore, India</p>
          </section>

        </div>
      </div>
    </div>
  );
}
