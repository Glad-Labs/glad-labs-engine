import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Glad Labs',
  description: 'Terms of Service for Glad Labs',
};

export default function TermsOfService() {
  const lastUpdated = new Date('2025-12-19').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-cyan-400 mb-4">
        Terms of Service
      </h1>

      <p className="text-gray-400 mb-8">
        <strong>Last Updated:</strong> {lastUpdated}
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        1. Agreement to Terms
      </h2>
      <p>
        By accessing and using this website, you accept and agree to be bound by
        the terms and provision of this agreement. If you do not agree to abide
        by the above, please do not use this service.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        2. Use License
      </h2>
      <p>
        Permission is granted to temporarily download one copy of the materials
        (information or software) on Glad Labs' website for personal,
        non-commercial transitory viewing only. This is the grant of a license,
        not a transfer of title, and under this license you may not:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>Modifying or copying the materials</li>
        <li>
          Using the materials for any commercial purpose or for any public
          display
        </li>
        <li>
          Attempting to decompile or reverse engineer any software contained on
          the website
        </li>
        <li>
          Removing any copyright or other proprietary notations from the
          materials
        </li>
        <li>
          Transferring the materials to another person or "mirroring" the
          materials on any other server
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        3. Disclaimer
      </h2>
      <p>
        The materials on Glad Labs' website are provided on an 'as is' basis.
        Glad Labs makes no warranties, expressed or implied, and hereby
        disclaims and negates all other warranties including, without
        limitation, implied warranties or conditions of merchantability, fitness
        for a particular purpose, or non-infringement of intellectual property
        or other violation of rights.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        4. Limitations
      </h2>
      <p>
        In no event shall Glad Labs or its suppliers be liable for any damages
        (including, without limitation, damages for loss of data or profit, or
        due to business interruption) arising out of the use or inability to use
        the materials on Glad Labs' website, even if Glad Labs or a Glad Labs
        authorized representative has been notified orally or in writing of the
        possibility of such damage.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        5. Accuracy of Materials
      </h2>
      <p>
        The materials appearing on Glad Labs' website could include technical,
        typographical, or photographic errors. Glad Labs does not warrant that
        any of the materials on its website are accurate, complete, or current.
        Glad Labs may make changes to the materials contained on its website at
        any time without notice.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">6. Links</h2>
      <p>
        Glad Labs has not reviewed all of the sites linked to its website and is
        not responsible for the contents of any such linked site. The inclusion
        of any link does not imply endorsement by Glad Labs of the site. Use of
        any such linked website is at the user's own risk.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        7. Modifications
      </h2>
      <p>
        Glad Labs may revise these terms of service for its website at any time
        without notice. By using this website, you are agreeing to be bound by
        the then current version of these terms of service.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        8. Governing Law
      </h2>
      <p>
        These terms and conditions are governed by and construed in accordance
        with the laws of the United States, and you irrevocably submit to the
        exclusive jurisdiction of the courts located in that location.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        9. User Content
      </h2>
      <p>
        You acknowledge that you are responsible for any content you submit to
        Glad Labs. You represent and warrant that such content:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>Is original and does not violate any third-party rights</li>
        <li>
          Does not contain defamatory, obscene, or other unlawful material
        </li>
        <li>
          Does not infringe on any patent, trademark, copyright, or other
          intellectual property
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        10. Prohibited Conduct
      </h2>
      <p>
        You may not access or use the website for any purpose other than that
        for which we make the website available. The website may not be used in
        connection with any commercial endeavor except those specifically
        endorsed or approved by us.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        11. Intellectual Property Rights
      </h2>
      <p>
        All content on Glad Labs' website, including text, graphics, logos,
        images, and software, is the property of Glad Labs or its content
        suppliers and is protected by international copyright laws. You are not
        granted any rights to use such content except as necessary to view and
        use the website in the ordinary course.
      </p>

      <h2 className="text-2xl font-bold text-cyan-300 mt-8 mb-4">
        12. Contact Information
      </h2>
      <p>
        If you have any questions about these Terms of Service, please contact
        us at:
      </p>
      <div className="bg-gray-800 p-4 rounded-lg mt-4 mb-4">
        <p>
          <strong>Glad Labs, LLC</strong>
          <br />
          Email: hello@gladlabs.io
          <br />
          Website: https://www.gladlabs.io
        </p>
      </div>
    </div>
  );
}
