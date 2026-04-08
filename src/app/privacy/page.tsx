"use client";

import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      <header className={`fixed left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled ? 'top-0' : 'top-2 md:top-6'
      }`}>
        <div className={`mx-auto transition-all duration-700 ${
          isScrolled ? 'w-full' : 'w-[95%] md:w-[91%]'
        }`}>
          <div className={`flex justify-between items-center border p-3 md:p-4 bg-background/80 backdrop-blur-md transition-all duration-700 ${
            isScrolled ? 'rounded-none' : 'rounded-full'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold ml-2 md:ml-8">BlazeNeuro</h2>
            <div className="flex items-center gap-2 md:gap-4 mr-2 md:mr-8">
              <MainNav />
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pt-24 md:pt-32 max-w-4xl mb-16">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Last updated: April 2, 2026</p>
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground">
          <h2>1. Introduction</h2>
          <p>
            Welcome to BlazeNeuro ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and services.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password (encrypted).</li>
            <li><strong>Profile Information:</strong> Optional profile picture and other profile details you choose to provide.</li>
            <li><strong>Content:</strong> Blog posts, comments, feedback (likes/dislikes), and other content you create or submit.</li>
          </ul>

          <h3>2.2 OAuth Authentication Data</h3>
          <p>When you sign in using OAuth providers (Google, GitHub, etc.), we collect:</p>
          <ul>
            <li><strong>Provider ID:</strong> Unique identifier from the OAuth provider</li>
            <li><strong>Access Tokens:</strong> Encrypted OAuth access tokens for API access</li>
            <li><strong>Refresh Tokens:</strong> Encrypted refresh tokens for maintaining session</li>
            <li><strong>Token Expiry:</strong> Timestamp for token validity</li>
            <li><strong>Scope:</strong> Permissions granted by you to our application</li>
            <li><strong>Profile Data:</strong> Name, email, and profile picture from your OAuth provider</li>
          </ul>

          <h3>2.3 Automatically Collected Information</h3>
          <ul>
            <li><strong>Session Data:</strong> Session tokens, IP addresses, and session expiry times</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, and interaction patterns</li>
            <li><strong>Cookies:</strong> Session cookies and preference cookies</li>
          </ul>

          <h2>3. OAuth Data Flow</h2>
          
          <h3>3.1 Authorization Process</h3>
          <ol>
            <li>You initiate OAuth login by clicking on a provider (Google, GitHub, etc.)</li>
            <li>You are redirected to the provider's authorization page</li>
            <li>You grant permissions to BlazeNeuro</li>
            <li>Provider redirects back with an authorization code</li>
            <li>We exchange the code for access and refresh tokens</li>
            <li>Tokens are encrypted and stored in our database</li>
            <li>A session is created with encrypted session token</li>
          </ol>

          <h3>3.2 Token Storage and Security</h3>
          <ul>
            <li>All OAuth tokens are encrypted using industry-standard encryption (AES-256)</li>
            <li>Tokens are stored in our secure PostgreSQL database</li>
            <li>Access tokens are used only for authorized API calls to the provider</li>
            <li>Refresh tokens are used only to obtain new access tokens when expired</li>
            <li>Tokens are never shared with third parties</li>
            <li>Tokens are deleted when you revoke access or delete your account</li>
          </ul>

          <h3>3.3 Data Retrieved from OAuth Providers</h3>
          <p>We only request and store the minimum necessary data:</p>
          <ul>
            <li><strong>Google:</strong> Email, name, profile picture, and user ID</li>
            <li><strong>GitHub:</strong> Email, name, profile picture, and user ID</li>
            <li><strong>Other Providers:</strong> Similar basic profile information</li>
          </ul>

          <h2>4. How We Use Your Information</h2>
          <ul>
            <li><strong>Account Management:</strong> Create and manage your account</li>
            <li><strong>Authentication:</strong> Verify your identity and maintain sessions</li>
            <li><strong>Service Delivery:</strong> Provide access to blog content and features</li>
            <li><strong>Personalization:</strong> Customize your experience</li>
            <li><strong>Communication:</strong> Send important updates and notifications</li>
            <li><strong>Analytics:</strong> Understand usage patterns and improve our services</li>
            <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
          </ul>

          <h2>5. Data Sharing and Disclosure</h2>
          
          <h3>5.1 We Do Not Sell Your Data</h3>
          <p>We do not sell, rent, or trade your personal information to third parties.</p>

          <h3>5.2 Limited Sharing</h3>
          <p>We may share your information only in these circumstances:</p>
          <ul>
            <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            <li><strong>Service Providers:</strong> Trusted third-party services (hosting, analytics) under strict confidentiality agreements</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
            <li><strong>Protection:</strong> To protect our rights, property, or safety, or that of our users</li>
          </ul>

          <h2>6. Data Retention</h2>
          <ul>
            <li><strong>Account Data:</strong> Retained while your account is active</li>
            <li><strong>OAuth Tokens:</strong> Retained until you revoke access or delete your account</li>
            <li><strong>Session Data:</strong> Automatically deleted after expiration (typically 30 days)</li>
            <li><strong>Blog Content:</strong> Retained indefinitely unless you delete it</li>
            <li><strong>Deleted Accounts:</strong> Personal data deleted within 30 days of account deletion</li>
          </ul>

          <h2>7. Your Rights and Choices</h2>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct your information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Revoke OAuth:</strong> Disconnect OAuth providers from your account</li>
            <li><strong>Cookie Control:</strong> Manage cookie preferences in your browser</li>
          </ul>

          <h2>8. Security Measures</h2>
          <ul>
            <li>End-to-end encryption for sensitive data</li>
            <li>Secure HTTPS connections for all communications</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Encrypted database storage</li>
            <li>Secure token management and rotation</li>
            <li>Protection against common vulnerabilities (SQL injection, XSS, CSRF)</li>
          </ul>

          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
          </p>

          <h2>11. Third-Party Services</h2>
          <p>Our application integrates with:</p>
          <ul>
            <li><strong>OAuth Providers:</strong> Google, GitHub (governed by their privacy policies)</li>
            <li><strong>Hosting Services:</strong> For application and database hosting</li>
            <li><strong>Analytics:</strong> For understanding usage patterns</li>
          </ul>
          <p>We are not responsible for the privacy practices of these third-party services.</p>

          <h2>12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>13. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
          <ul>
            <li>Email: privacy@blazeneuro.com</li>
            <li>Address: BlazeNeuro, [Your Address]</li>
          </ul>

          <h2>14. Data Protection Officer</h2>
          <p>
            For EU residents, you may contact our Data Protection Officer at: dpo@blazeneuro.com
          </p>

          <h2>15. Consent</h2>
          <p>
            By using our service, you consent to our Privacy Policy and agree to its terms. If you do not agree with this policy, please do not use our service.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
