import Link from 'next/link';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Globe2,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  Target,
  Users,
} from 'lucide-react';

export const metadata = {
  title: 'About Us | FitTrust Nigeria Limited',
  description:
    'Learn about FitTrust Nigeria Limited, a Nigerian supplier of medical equipment, laboratory products, diagnostic supplies, and healthcare consumables.',
};

const values = [
  {
    title: 'Excellence',
    description:
      'We strive to maintain high standards across our products, services, and customer relationships.',
    icon: Award,
  },
  {
    title: 'Professionalism',
    description:
      'We approach our customers, partners, and operations with professionalism and responsibility.',
    icon: Users,
  },
  {
    title: 'Trust & Integrity',
    description:
      'We value honesty, transparency, and relationships built on trust and integrity.',
    icon: ShieldCheck,
  },
  {
    title: 'Customer Satisfaction',
    description:
      'Our customers remain at the centre of what we do, and we work to understand and meet their needs.',
    icon: HeartHandshake,
  },
  {
    title: 'Quality Service',
    description:
      'We are committed to dependable products and responsive service for our customers and partners.',
    icon: CheckCircle2,
  },
  {
    title: 'Hard Work',
    description:
      'We believe in dedication, consistency, and continuous improvement in everything we do.',
    icon: Target,
  },
];

const products = [
  'Blood Bags',
  'Blood Transfusion Sets',
  'Infrared Thermometers',
  'Widal Test Kits & Reagents',
  'Hepatitis B Test Strips',
  'Hepatitis C Test Strips',
  'Pregnancy Test Kits',
  'Glucometers',
  'Lipid Profile Machines',
  'Hemoglobin Machines',
  'Antiseptics',
  'Hand Sanitizers',
];

const brands = ['PROMED', 'FITHEALTH', 'INSIGHTCARE', 'MERIT'];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl text-white">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Trusted Healthcare Solutions
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              About FitTrust Nigeria Limited
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              A Nigerian company providing medical equipment, diagnostic
              products, laboratory supplies, and healthcare consumables to
              customers and distribution partners across Nigeria and
              neighbouring West African markets.
            </p>

          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">

          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600">
              <Stethoscope className="h-5 w-5" />
              Who We Are
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Quality healthcare products you can trust.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-7 text-gray-600">
            <p>
              <strong className="text-gray-900">
                FitTrust Nigeria Limited
              </strong>{' '}
              is an indigenous Nigerian company duly registered in Nigeria.
              We are suppliers of medical and surgical equipment, laboratory
              products, diagnostic supplies, and healthcare consumables.
            </p>

            <p>
              We work with reputable manufacturers and supply partners across
              international markets, including China, India, and South Korea,
              while also sourcing selected products locally in Nigeria.
            </p>

            <p>
              Our products are supplied through distribution channels across
              Nigeria and to neighbouring West African markets, helping
              healthcare providers and other stakeholders access dependable
              medical and laboratory solutions.
            </p>
          </div>

        </div>
      </section>

      {/* MISSION */}
      <section className="bg-blue-50">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:py-20">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <Target className="h-7 w-7" />
          </div>

          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Our Mission
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            To be the go-to provider of quality medical and laboratory
            equipment in Nigeria.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-gray-600">
            We are committed to providing quality products, professional
            service, and dependable healthcare solutions while building
            lasting relationships with our customers, distributors, and
            partners.
          </p>

        </div>
      </section>

      {/* WHAT WE PROVIDE */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              What We Provide
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Medical & Laboratory Solutions
            </h2>

            <p className="mt-4 text-gray-600">
              Our portfolio covers a wide range of diagnostic, laboratory,
              medical, and healthcare products.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {product}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FLAGSHIP BRANDS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Our Brands
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Trusted Product Brands
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              FitTrust Nigeria Limited is associated with trusted healthcare
              product brands serving customers in Nigeria and neighbouring
              markets.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {brands.map((brand) => (
              <div
                key={brand}
                className="flex min-h-28 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 px-5 text-center"
              >
                <span className="text-xl font-extrabold tracking-wide text-blue-700 sm:text-2xl">
                  {brand}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">
            <p className="text-base leading-7 text-gray-600">
              Our flagship offerings include{' '}
              <strong className="text-gray-900">
                PROMED diagnostic test strips, point-of-care machines,
                Widal reagents, and antisera
              </strong>
              , which have gained acceptance in Nigeria and surrounding
              markets.
            </p>
          </div>

        </div>
      </section>

      {/* VALUES */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              What We Stand For
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Core Values
            </h2>

            <p className="mt-4 text-gray-600">
              The principles that guide how we serve our customers and
              partners.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {value.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* REACH */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="grid items-center gap-10 lg:grid-cols-2">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600">
                <Globe2 className="h-5 w-5" />
                Our Reach
              </div>

              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Serving healthcare markets beyond borders.
              </h2>

              <p className="mt-5 leading-7 text-gray-600">
                Through our distribution network, our products reach
                customers and partners across Nigeria and neighbouring West
                African countries.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-700 p-8 text-white shadow-xl">
              <div className="space-y-5">

                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-blue-100">Primary Market</p>
                  <p className="mt-1 text-2xl font-bold">
                    Nigeria
                  </p>
                </div>

                <div className="flex justify-center text-blue-200">
                  ↓
                </div>

                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-blue-100">Distribution</p>
                  <p className="mt-1 text-2xl font-bold">
                    Nationwide
                  </p>
                </div>

                <div className="flex justify-center text-blue-200">
                  ↓
                </div>

                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-blue-100">Regional Reach</p>
                  <p className="mt-1 text-2xl font-bold">
                    West Africa
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CHAIRMAN MESSAGE */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Chairman's Message
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              A commitment to quality and service.
            </h2>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">

            <div className="mb-6 text-5xl leading-none text-blue-400">
              “
            </div>

            <div className="space-y-5 text-base leading-8 text-gray-300">
              <p>
                At FitTrust Nigeria Limited, our mission is to become a
                trusted destination for quality medical and laboratory
                equipment and healthcare products in Nigeria.
              </p>

              <p>
                Our philosophy is centred on hard work, excellence,
                professionalism, trust, integrity, customer satisfaction,
                and quality service.
              </p>

              <p>
                We are proud of our dedicated and motivated workforce, whose
                commitment continues to help us serve our customers and
                stakeholders with professionalism and care.
              </p>

              <p>
                We sincerely appreciate our esteemed customers and partners
                for their continued patronage, trust, and unwavering support.
              </p>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="font-bold text-white">
                Chairman
              </p>
              <p className="text-sm text-gray-400">
                FitTrust Nigeria Limited
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center text-white sm:px-6 lg:px-8">

          <h2 className="text-3xl font-bold sm:text-4xl">
            Looking for quality medical supplies?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
            Explore our product catalogue or contact FitTrust Nigeria
            Limited directly to learn more about our products and services.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              Contact Us
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}
