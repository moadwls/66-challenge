'use client';

import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f4f3ee] text-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#f4f3ee] border-b border-gray-200 p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-500"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-20">
        <p className="text-gray-500 text-sm">Last updated: January 2025</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using 66 Challenge ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. Description of Service</h2>
          <p className="text-gray-600 leading-relaxed">
            66 Challenge is a habit tracking application designed to help you build discipline over 66 days. The App allows you to track daily habits, connect with friends, view leaderboards, and earn achievements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. User Accounts</h2>
          <p className="text-gray-600 leading-relaxed">
            To use certain features of the App, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Maintaining the confidentiality of your password</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. Acceptable Use</h2>
          <p className="text-gray-600 leading-relaxed">You agree not to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Use the App for any illegal purpose</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Upload inappropriate, offensive, or harmful content</li>
            <li>Attempt to gain unauthorized access to the App or its systems</li>
            <li>Use automated systems or bots to access the App</li>
            <li>Impersonate another person or entity</li>
            <li>Interfere with or disrupt the App's functionality</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. User Content</h2>
          <p className="text-gray-600 leading-relaxed">
            You retain ownership of content you upload (such as profile photos and progress photos). By uploading content, you grant us a non-exclusive, worldwide license to use, display, and distribute that content within the App for its intended purpose.
          </p>
          <p className="text-gray-600 leading-relaxed">
            You are solely responsible for the content you upload and must ensure you have the right to share it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. Social Features</h2>
          <p className="text-gray-600 leading-relaxed">
            The App includes social features such as following other users, activity feeds, and leaderboards. By using these features, you understand that:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Your activity may be visible to other users</li>
            <li>Failed days may be displayed with playful "mocking" messages to encourage accountability</li>
            <li>Your ranking on leaderboards is public</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">7. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            The App, including its design, features, and content (excluding user content), is owned by us and protected by intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the App.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">8. Disclaimer of Warranties</h2>
          <p className="text-gray-600 leading-relaxed">
            The App is provided "as is" without warranties of any kind. We do not guarantee that the App will be uninterrupted, error-free, or secure. Your use of the App is at your own risk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">9. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">10. Account Termination</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. You may also delete your account at any time through the App settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">11. Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We may modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms. We will notify users of significant changes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">12. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these terms, contact us at: <span className="text-[#FF4D00] font-medium">the66challenge@gmail.com</span>
          </p>
        </section>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-center text-gray-400 text-sm">
            66 Challenge - Build discipline, one day at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
