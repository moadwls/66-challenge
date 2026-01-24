'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
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
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-20">
        <p className="text-gray-500 text-sm">Last updated: January 2025</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to 66 Challenge ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">
            <strong>Account Information:</strong> When you create an account, we collect your name, email address, and password.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <strong>Profile Information:</strong> Your username, profile photo, and personal goal that you choose to provide.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <strong>Usage Data:</strong> Your habit completion records, streak data, achievements, and progress photos you upload.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <strong>Social Data:</strong> Your connections with other users (who you follow and who follows you) and activity feed interactions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed">We use your information to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Provide and maintain the app's functionality</li>
            <li>Track your habit progress and streaks</li>
            <li>Enable social features (friends, leaderboard, activity feed)</li>
            <li>Send you notifications and reminders (with your permission)</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. Data Storage</h2>
          <p className="text-gray-600 leading-relaxed">
            Your data is stored securely using Supabase, a trusted cloud database provider. We implement appropriate security measures to protect your personal information. Some data (like your habit checklist state) is also stored locally on your device for offline functionality.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Data Sharing</h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell your personal data. Your information may be visible to other users in the following ways:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Your name and username are visible to users who search for friends</li>
            <li>Your activity (day completions, achievements) is visible to users who follow you</li>
            <li>Your position on the leaderboard is visible to all users</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of notifications</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">7. Children's Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">8. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">9. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about this privacy policy, please contact us at: <span className="text-[#FF4D00] font-medium">the66challenge@gmail.com</span>
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
