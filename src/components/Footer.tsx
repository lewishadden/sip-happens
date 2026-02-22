import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-espresso text-ivory-mist mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">&#127864;</span>
              <span className="text-lg font-bold text-ivory-mist">Sip Happens</span>
            </div>
            <p className="text-sm text-ivory-mist leading-relaxed">
              Reviewing espresso martinis around the globe, one sip at a time. Because life&apos;s
              too short for bad cocktails.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ivory-mist mb-4">Navigate</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-caramel transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-caramel transition-colors">
                  All Reviews
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-caramel transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-espresso mt-8 pt-8 text-center text-xs text-ivory-mist/60">
          <p>
            &copy; {new Date().getFullYear()} Sip Happens. All rights reserved. Drink responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
