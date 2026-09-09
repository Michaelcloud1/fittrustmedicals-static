import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

export const metadata = {
  title: 'Contact Us | FitTrust Nigeria Limited',
  description:
    'Contact FitTrust Nigeria Limited for medical equipment, laboratory supplies, diagnostic products, and healthcare consumables.',
};

const offices = [
  {
    title: 'Head Office — Lagos',
    address: (
      <>
        Shop 12, No. 35 Idagundanran Street,
        <br />
        Idumota, Lagos, Nigeria
      </>
    ),
  },
  {
    title: 'Branch Office — Kano',
    address: (
      <>
        Shop No. D2, Malam Kato Square Market,
        <br />
        Off Niger Street, Fagge, Kano, Nigeria
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Building2 className="h-4 w-4" />
              FitTrust Nigeria Limited
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Contact Us
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Get in touch with FitTrust Nigeria Limited for medical
              equipment, laboratory supplies, diagnostic products, and
              healthcare consumables.
            </p>
          </div>
        </div>
      </section>

      {/* OFFICES */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Our Offices
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Find Us
            </h2>

            <p className="mt-4 text-gray-600">
              Visit or contact our offices in Lagos and Kano.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">

            {offices.map((office) => (
              <div
                key={office.title}
                className="rounded-2xl border border-gray-100 bg-slate-50 p-7 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <MapPin className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {office.title}
                </h3>

                <p className="mt-4 text-base leading-7 text-gray-600">
                  {office.address}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CONTACT DETAILS */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <Phone className="h-7 w-7 text-blue-600" />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Phone
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Contact FitTrust Nigeria Limited for enquiries and product
                information.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <Mail className="h-7 w-7 text-blue-600" />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Email
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Get in touch with our team for enquiries and business
                correspondence.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <MapPin className="h-7 w-7 text-blue-600" />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Locations
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Lagos Head Office and Kano Branch Office.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center text-white sm:px-6 lg:px-8">

          <h2 className="text-3xl font-bold sm:text-4xl">
            Looking for medical supplies?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
            Explore our catalogue to learn more about our medical,
            laboratory, and diagnostic products.
          </p>

          <div className="mt-7">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
