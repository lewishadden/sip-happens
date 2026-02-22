import Link from 'next/link';

export const metadata = {
  title: 'About | Sip Happens',
  description:
    "The story behind Sip Happens — our mission to find the world's best espresso martini.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-dark-espresso mb-8">About Sip Happens</h1>

      <div className="prose max-w-none space-y-6">
        <div className="bg-ivory-mist rounded-2xl p-8 shadow-sm border border-ivory-mist-dark">
          <h2 className="text-2xl font-semibold text-espresso mb-4">The Mission</h2>
          <p className="text-espresso leading-relaxed mb-4">
            It started with a bad espresso martini at an airport bar. You know the type — lukewarm,
            over-sweet, made with instant coffee and served in a plastic cup. That was the moment we
            decided someone needed to start keeping score.
          </p>
          <p className="text-espresso leading-relaxed mb-4">
            <strong className="text-dark-espresso">Sip Happens</strong> is a blog dedicated to
            reviewing espresso martinis from bars, restaurants, and hidden speakeasies around the
            world. We believe that a great espresso martini is one of life&apos;s simple pleasures —
            fresh espresso, quality vodka, a touch of sweetness, and that perfect layer of crema on
            top.
          </p>
          <p className="text-espresso leading-relaxed">
            We rate each drink on a five-star scale, considering everything from the quality of the
            espresso to the presentation, the atmosphere of the venue, and of course, the overall
            taste.
          </p>
        </div>

        <div className="bg-ivory-mist rounded-2xl p-8 shadow-sm border border-ivory-mist-dark">
          <h2 className="text-2xl font-semibold text-espresso mb-4">What We Look For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: '&#9749;',
                title: 'Fresh Espresso',
                desc: 'Pulled to order, not pre-brewed. The coffee should be the star of the show.',
              },
              {
                icon: '&#127864;',
                title: 'Quality Spirits',
                desc: 'Premium vodka (or a creative substitute) that complements rather than overpowers.',
              },
              {
                icon: '&#10024;',
                title: 'The Crema',
                desc: 'That thick, persistent foam on top is non-negotiable. It should hold a coffee bean.',
              },
              {
                icon: '&#9878;',
                title: 'Balance',
                desc: 'Sweet, bitter, and boozy in perfect harmony. No single element should dominate.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span
                  className="text-3xl flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
                <div>
                  <h3 className="font-semibold text-dark-espresso">{item.title}</h3>
                  <p className="text-sm text-light-espresso mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ivory-mist rounded-2xl p-8 shadow-sm border border-ivory-mist-dark">
          <h2 className="text-2xl font-semibold text-espresso mb-4">Our Rating Scale</h2>
          <div className="space-y-3">
            {[
              {
                stars: '5.0',
                label: 'Transcendent',
                desc: 'A life-changing espresso martini. Pilgrimage-worthy.',
              },
              {
                stars: '4.0 - 4.9',
                label: 'Excellent',
                desc: 'Outstanding drink — well worth seeking out.',
              },
              {
                stars: '3.0 - 3.9',
                label: 'Good',
                desc: 'Solid espresso martini, enjoyable but not remarkable.',
              },
              {
                stars: '2.0 - 2.9',
                label: 'Mediocre',
                desc: "Drinkable, but won't remember it tomorrow.",
              },
              { stars: '1.0 - 1.9', label: 'Poor', desc: 'Order something else. Anything else.' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-ivory-mist-dark transition-colors"
              >
                <span className="text-caramel font-bold text-sm w-16 flex-shrink-0 pt-0.5">
                  {item.stars}
                </span>
                <div>
                  <span className="font-semibold text-dark-espresso">{item.label}</span>
                  <span className="text-light-espresso text-sm ml-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/reviews"
          className="inline-flex items-center justify-center px-8 py-3 bg-espresso text-ivory-mist font-semibold rounded-full hover:bg-dark-espresso transition-all"
        >
          Browse Our Reviews
        </Link>
      </div>
    </div>
  );
}
