"use client";

import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Last updated: April 2, 2026</p>
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using BlazeNeuro ("Service," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            BlazeNeuro is a web application that provides:
          </p>
          <ul>
            <li>Blog content and articles on neural technology and AI</li>
            <li>User account management and authentication</li>
            <li>OAuth-based authentication through third-party providers</li>
            <li>Content interaction features (likes, comments, feedback)</li>
            <li>Admin dashboard for content management</li>
            <li>Analytics and user insights</li>
          </ul>

          <h2>3. User Accounts</h2>
          
          <h3>3.1 Account Creation</h3>
          <ul>
            <li>You must be at least 13 years old to create an account</li>
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You are responsible for all activities under your account</li>
            <li>You must notify us immediately of any unauthorized access</li>
          </ul>

          <h3>3.2 OAuth Authentication</h3>
          <p>When using OAuth authentication:</p>
          <ul>
            <li>You authorize us to access your profile information from the OAuth provider</li>
            <li>You grant us permission to store encrypted OAuth tokens</li>
            <li>You understand that we will use these tokens only for authentication and authorized API calls</li>
            <li>You can revoke OAuth access at any time through your account settings</li>
            <li>Revoking OAuth access may limit or disable certain features</li>
          </ul>

          <h3>3.3 Account Termination</h3>
          <p>We reserve the right to suspend or terminate your account if:</p>
          <ul>
            <li>You violate these Terms of Service</li>
            <li>You engage in fraudulent or illegal activities</li>
            <li>You abuse or misuse the Service</li>
            <li>Your account remains inactive for an extended period</li>
            <li>We are required to do so by law</li>
          </ul>

          <h2>4. User Content</h2>
          
          <h3>4.1 Your Content</h3>
          <ul>
            <li>You retain ownership of content you create or submit</li>
            <li>You grant us a license to use, display, and distribute your content</li>
            <li>You are responsible for the content you post</li>
            <li>You must have the right to post the content you submit</li>
          </ul>

          <h3>4.2 Prohibited Content</h3>
          <p>You may not post content that:</p>
          <ul>
            <li>Is illegal, harmful, or violates any laws</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains malware, viruses, or malicious code</li>
            <li>Is defamatory, obscene, or offensive</li>
            <li>Harasses, threatens, or bullies others</li>
            <li>Contains spam or unsolicited advertising</li>
            <li>Impersonates others or misrepresents your identity</li>
            <li>Violates privacy rights of others</li>
          </ul>

          <h3>4.3 Content Moderation</h3>
          <ul>
            <li>We reserve the right to remove or modify any content</li>
            <li>We may review content for compliance with these Terms</li>
            <li>We are not obligated to monitor all user content</li>
            <li>Removal of content does not imply liability on our part</li>
          </ul>

          <h2>5. OAuth Data Usage</h2>
          
          <h3>5.1 Token Management</h3>
          <ul>
            <li>OAuth tokens are encrypted and stored securely</li>
            <li>Tokens are used only for authentication and authorized operations</li>
            <li>Access tokens are refreshed automatically when expired</li>
            <li>Tokens are deleted when you disconnect the OAuth provider</li>
            <li>We never share your OAuth tokens with third parties</li>
          </ul>

          <h3>5.2 Provider Permissions</h3>
          <p>We request only the minimum necessary permissions:</p>
          <ul>
            <li><strong>Profile Information:</strong> To create and manage your account</li>
            <li><strong>Email Address:</strong> For account identification and communication</li>
            <li><strong>Basic Profile:</strong> Name and profile picture for display</li>
          </ul>

          <h3>5.3 Revoking Access</h3>
          <ul>
            <li>You can revoke OAuth access through your account settings</li>
            <li>You can also revoke access directly from the OAuth provider</li>
            <li>Revoking access will disconnect the provider from your account</li>
            <li>Your account will remain active but you'll need to use alternative login methods</li>
          </ul>

          <h2>6. Acceptable Use</h2>
          
          <h3>6.1 You Agree Not To:</h3>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use automated systems (bots, scrapers) without permission</li>
            <li>Reverse engineer or decompile any part of the Service</li>
            <li>Collect user information without consent</li>
            <li>Transmit viruses, malware, or harmful code</li>
            <li>Impersonate others or create fake accounts</li>
            <li>Engage in any activity that harms the Service or its users</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          
          <h3>7.1 Our Content</h3>
          <ul>
            <li>The Service and its original content are owned by BlazeNeuro</li>
            <li>Our trademarks, logos, and brand features are protected</li>
            <li>You may not use our intellectual property without permission</li>
          </ul>

          <h3>7.2 User Content License</h3>
          <p>By posting content, you grant us:</p>
          <ul>
            <li>A worldwide, non-exclusive, royalty-free license</li>
            <li>The right to use, reproduce, modify, and display your content</li>
            <li>The right to distribute your content through the Service</li>
            <li>The right to create derivative works for Service improvement</li>
          </ul>

          <h2>8. Privacy and Data Protection</h2>
          <ul>
            <li>Your use of the Service is governed by our Privacy Policy</li>
            <li>We collect and process data as described in the Privacy Policy</li>
            <li>OAuth data is handled according to our OAuth Data Flow procedures</li>
            <li>You have rights regarding your personal data (access, deletion, portability)</li>
            <li>We implement security measures to protect your data</li>
          </ul>

          <h2>9. Third-Party Services</h2>
          
          <h3>9.1 OAuth Providers</h3>
          <ul>
            <li>We integrate with third-party OAuth providers (Google, GitHub, etc.)</li>
            <li>These providers have their own terms of service and privacy policies</li>
            <li>We are not responsible for the practices of these providers</li>
            <li>Your use of OAuth providers is subject to their terms</li>
          </ul>

          <h3>9.2 External Links</h3>
          <ul>
            <li>The Service may contain links to external websites</li>
            <li>We are not responsible for the content of external sites</li>
            <li>Visiting external links is at your own risk</li>
          </ul>

          <h2>10. Disclaimers</h2>
          
          <h3>10.1 Service "As Is"</h3>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>

          <h3>10.2 No Guarantee</h3>
          <ul>
            <li>We do not guarantee uninterrupted or error-free service</li>
            <li>We do not guarantee the accuracy or reliability of content</li>
            <li>We do not guarantee security against all threats</li>
            <li>We may modify or discontinue the Service at any time</li>
          </ul>

          <h2>11. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLAZENEURO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </p>

          <h2>12. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless BlazeNeuro, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Your content posted on the Service</li>
          </ul>

          <h2>13. Changes to Terms</h2>
          <ul>
            <li>We reserve the right to modify these Terms at any time</li>
            <li>We will notify you of significant changes via email or Service notification</li>
            <li>Continued use of the Service after changes constitutes acceptance</li>
            <li>If you disagree with changes, you must stop using the Service</li>
          </ul>

          <h2>14. Termination</h2>
          
          <h3>14.1 By You</h3>
          <ul>
            <li>You may delete your account at any time through account settings</li>
            <li>Deletion is permanent and cannot be undone</li>
            <li>Your content may remain in backups for a limited time</li>
          </ul>

          <h3>14.2 By Us</h3>
          <ul>
            <li>We may terminate or suspend your account for Terms violations</li>
            <li>We may terminate the Service entirely with notice</li>
            <li>Upon termination, your right to use the Service ceases immediately</li>
          </ul>

          <h2>15. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
          </p>

          <h2>16. Dispute Resolution</h2>
          
          <h3>16.1 Informal Resolution</h3>
          <p>
            Before filing a claim, you agree to try to resolve the dispute informally by contacting us at legal@blazeneuro.com.
          </p>

          <h3>16.2 Arbitration</h3>
          <p>
            Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except where prohibited by law.
          </p>

          <h2>17. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>

          <h2>18. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and BlazeNeuro regarding the Service.
          </p>

          <h2>19. Contact Information</h2>
          <p>For questions about these Terms, please contact us at:</p>
          <ul>
            <li>Email: legal@blazeneuro.com</li>
            <li>Address: BlazeNeuro, [Your Address]</li>
          </ul>

          <h2>20. Acknowledgment</h2>
          <p>
            BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
