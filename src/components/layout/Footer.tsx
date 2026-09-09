import Link from 'next/link';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* COMPANY */}
          <div>
            <h2 className="text-xl font-extrabold">
              FITTRUST <span className="text-blue-400">MEDICALS</span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              Nigeria's Trusted Medical Equipment & Healthcare Supplies
              Provider. Committed to quality and excellence in healthcare.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <Link href="/about" className="transition hover:text-white">
                  About Us
                </Link>
              </li>

              <li>
                <Link href="/products" className="transition hover:text-white">
                  Shop Now
                </Link>
              </li>

              <li>
                <Link href="/contact" className="transition hover:text-white">
                  Contact Us
                </Link>
              </li>

              <li>
                <Link href="/blog" className="transition hover:text-white">
                  Health Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* CUSTOMER SERVICE */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Customer Service
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <Link href="/returns" className="transition hover:text-white">
                  Return Policy
                </Link>
              </li>

              <li>
                <Link href="/shipping" className="transition hover:text-white">
                  Shipping Info
                </Link>
              </li>

              <li>
                <Link href="/faq" className="transition hover:text-white">
                  FAQs
                </Link>
              </li>

              <li>
                <Link href="/track-order" className="transition hover:text-white">
                  Track Order
                </Link>
              </li>

              <li>
                <Link href="/support" className="transition hover:text-white">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact Info
            </h3>

            <div className="mt-4 space-y-5 text-sm text-slate-300">

              {/* LAGOS */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-400" />

                <div>
                  <p className="font-semibold text-white">
                    Head Office — Lagos
                  </p>

                  <p className="mt-1 leading-6">
                    Shop 12, No. 35 Idagundanran Street,
                    <br />
                    Idumota, Lagos, Nigeria
                  </p>
                </div>
              </div>

              {/* KANO */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-400" />

                <div>
                  <p className="font-semibold text-white">
                    Branch Office — Kano
                  </p>

                  <p className="mt-1 leading-6">
                    Shop No. D2, Malam Kato Square Market,
                    <br />
                    Off Niger Street, Fagge, Kano, Nigeria
                  </p>
                </div>
              </div>

              {/* PHONE */}
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-blue-400" />

                <div>
                  <p className="font-semibold text-white">Phone</p>

                  <p className="mt-1">
                    +234 816 409 1531
                    <br />
                    +234 808 348 3440
                  </p>
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-blue-400" />

                <div>
                  <p className="font-semibold text-white">Email</p>

                  <a
                    href="mailto:fittrustsurgical@gmail.com"
                    className="mt-1 block transition hover:text-white"
                  >
                    fittrustsurgical@gmail.com
                  </a>
                </div>
              </div>

              {/* BUSINESS HOURS */}
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-blue-400" />

                <div>
                  <p className="font-semibold text-white">Business Hours</p>

                  <p className="mt-1">
                    Mon - Fri: 9am - 6pm
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-10 border-t border-slate-700 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">

            <p className="text-sm text-slate-400">
              © 2026 FitTrust Medicals. All rights reserved.
            </p>

            <p className="text-sm text-slate-400">
              Secure Payment
            </p>

          </div>
        </div>

      </div>
    </footer>
  );
}
