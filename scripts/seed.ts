import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.POSTGRES_URL!);

async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      bar_name TEXT,
      location TEXT,
      rating REAL CHECK(rating >= 0 AND rating <= 5),
      price REAL,
      currency TEXT DEFAULT 'USD',
      image_url TEXT,
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      author_id INTEGER REFERENCES users(id)
    )
  `;

  await sql`
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS location_data JSONB
  `;

  console.log("Tables created.");
}

async function seedAdmin() {
  const rows = await sql`SELECT COUNT(*) as count FROM users`;
  if (Number(rows[0].count) > 0) {
    console.log("Admin user already exists, skipping.");
    return;
  }

  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "espresso123", 12);
  await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${process.env.ADMIN_EMAIL || "admin@siphappens.com"}, ${hash}, 'Sip Happens Admin')
  `;
  console.log("Admin user created.");
}

async function seedPosts() {

  const posts = [
    {
      title: "The Perfect Pour at Bar Termini, London",
      slug: "bar-termini-london",
      excerpt: "Tucked away in Soho, Bar Termini serves an espresso martini that rivals the best in the world. Rich, velvety, and perfectly balanced.",
      content: `# Bar Termini, London

Bar Termini sits quietly on Old Compton Street in Soho, a slender Italian-inspired bar that feels like stepping into a Roman railway cafe from the 1960s. But don't let the modest exterior fool you — what they do with espresso and vodka here is nothing short of extraordinary.

## The Drink

The espresso martini at Bar Termini is a masterclass in restraint. They use their own house-roasted espresso, pulled fresh for each drink. The crema on top is thick enough to hold three coffee beans without them sinking — always a good sign.

**The balance is impeccable.** There's a bittersweet depth from the espresso that plays beautifully against the clean bite of premium vodka. They use a coffee liqueur sparingly, letting the actual coffee do the heavy lifting. The result is a drink that tastes like coffee first, cocktail second.

## The Atmosphere

The bar is intimate — perhaps 20 seats at most. The lighting is warm amber, the bartenders wear waistcoats, and the whole place hums with quiet conversation. It's the kind of place where you nurse your drink slowly and appreciate every sip.

## The Verdict

This is the espresso martini that all others should be measured against. It's sophisticated without being pretentious, strong without being harsh, and sweet without being cloying. If you're in London, this is a pilgrimage worth making.

**Price:** £14 | **Serving Style:** Classic coupe glass | **Coffee Bean Garnish:** Three, perfectly placed`,
      bar_name: "Bar Termini",
      location: "London, United Kingdom",
      location_data: { place_id: "ChIJdd4hrwug2EcRmSrV3Vo6llI", formatted_address: "7 Old Compton St, London W1D 5JE, UK", city: "London", country: "United Kingdom", lat: 51.5133, lng: -0.1312 },
      rating: 4.8,
      price: 14,
      currency: "GBP",
      image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
    },
    {
      title: "Melbourne's Finest at Eau de Vie",
      slug: "eau-de-vie-melbourne",
      excerpt: "In a city obsessed with coffee culture, Eau de Vie delivers an espresso martini that lives up to Melbourne's exacting standards.",
      content: `# Eau de Vie, Melbourne

Melbourne takes its coffee more seriously than perhaps any other city on earth. So when a cocktail bar in this town claims to make a great espresso martini, they'd better deliver. Eau de Vie doesn't just deliver — they exceed every expectation.

## The Drink

Hidden behind an unmarked door on Malthouse Lane, Eau de Vie approaches their espresso martini with the precision of a specialty coffee roaster. They source single-origin beans from a local roaster and pull their espresso on a La Marzocca — the same machine you'd find in Melbourne's best cafes.

**The texture is extraordinary.** Silky, almost creamy, with a foam that's dense and persistent. The coffee flavour is bright and complex — you can taste notes of dark chocolate and dried cherry. The sweetness is dialled back compared to most versions, which lets the coffee character really shine.

## The Atmosphere

The speakeasy vibe is strong here. Dark wood, leather banquettes, and bartenders who clearly love what they do. The menu is extensive, but regulars know that the espresso martini is the real star.

## The Verdict

This is Melbourne in a glass — unpretentious excellence. The quality of the coffee comes through in every sip, and the balance between bitter, sweet, and boozy is spot-on. A must-visit for any espresso martini enthusiast.

**Price:** AUD $24 | **Serving Style:** Nick and Nora glass | **Coffee Bean Garnish:** Single bean, centred`,
      bar_name: "Eau de Vie",
      location: "Melbourne, Australia",
      location_data: { place_id: "ChIJ90260mVG1moRkM2MIXVWBAQ", formatted_address: "1 Malthouse Ln, Melbourne VIC 3000, Australia", city: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631 },
      rating: 4.6,
      price: 24,
      currency: "AUD",
      image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
    },
    {
      title: "A Disappointment in Paradise: Waikiki Beach Bar",
      slug: "waikiki-beach-bar-hawaii",
      excerpt: "Not every espresso martini can be a winner. This beachside attempt in Honolulu left much to be desired.",
      content: `# Waikiki Beach Bar, Honolulu

Sometimes the setting writes a cheque that the drink can't cash. Watching the sunset over Waikiki Beach with a cocktail in hand sounds like paradise. And it is — until you take your first sip of their espresso martini.

## The Drink

Let me start with what they got right: it arrived quickly and it was cold. That's about where the compliments end.

**The espresso was clearly not fresh.** It had that stale, slightly burnt taste of coffee that's been sitting in a thermal carafe for too long. The sweetness was overwhelming — they went heavy on the coffee liqueur and what tasted like simple syrup. The vodka was cheap and left a harsh burn on the finish.

The crema was thin and disappeared within seconds, leaving a murky brown liquid that looked more like iced coffee than a cocktail. No coffee bean garnish, which felt like a metaphor for the overall lack of care.

## The Atmosphere

To be fair, the view is spectacular. There's something magical about the warm Hawaiian breeze and the sound of waves. But even paradise can't save a bad drink.

## The Verdict

Skip the espresso martini here and order a Mai Tai instead — they do those well. This drink felt like an afterthought on the menu, made with pre-prepared ingredients and no love. At $22 USD, it's a hard pass.

**Price:** $22 USD | **Serving Style:** Martini glass (warm) | **Coffee Bean Garnish:** None`,
      bar_name: "Waikiki Beach Bar",
      location: "Honolulu, Hawaii",
      location_data: { place_id: "ChIJTUbDjDsYAHwRbJen81_1KEs", formatted_address: "2005 Kalia Rd, Honolulu, HI 96815, USA", city: "Honolulu", country: "United States", lat: 21.2769, lng: -157.8290 },
      rating: 1.5,
      price: 22,
      currency: "USD",
      image_url: "https://images.unsplash.com/photo-1507914372368-b2b085b925a1?w=800&q=80",
    },
    {
      title: "Nordic Perfection at Himkok, Oslo",
      slug: "himkok-oslo",
      excerpt: "In a city known for its innovative cocktail scene, Himkok brings Scandinavian precision to the classic espresso martini.",
      content: `# Himkok, Oslo

Oslo's cocktail scene has exploded in recent years, and Himkok sits at the very centre of it. This distillery-bar hybrid produces its own spirits on-site, and their approach to the espresso martini reflects this obsessive attention to craft.

## The Drink

Himkok uses their house-distilled aquavit as a split base with vodka, which gives the drink a subtle caraway and dill complexity that sounds strange but works beautifully. The espresso is sourced from Tim Wendelboe, arguably one of the best roasters in the world.

**The result is unlike any espresso martini I've had.** The aquavit adds an earthy, herbal dimension that complements the coffee's natural bitterness. The sweetness comes from a house-made demerara syrup rather than coffee liqueur, which keeps things clean and lets the espresso speak.

The foam is immaculate — thick, creamy, and lasting. They dust it with freshly grated tonka bean, which adds a vanilla-like aroma that hits you before you even take a sip.

## The Atmosphere

Industrial chic done right. Exposed brick, copper stills visible behind glass, and a soundtrack of Nordic jazz. The bartenders are friendly and knowledgeable — ask them about the distillation process and prepare for a passionate 20-minute education.

## The Verdict

This is innovation at its finest. By respecting the classic format while adding their own Nordic twist, Himkok has created something truly special. It's not the traditional espresso martini, but it might be the best evolution of it I've ever tasted.

**Price:** NOK 195 | **Serving Style:** Custom ceramic cup | **Coffee Bean Garnish:** Grated tonka bean`,
      bar_name: "Himkok",
      location: "Oslo, Norway",
      location_data: { place_id: "ChIJOfBn8mFuQUYRmh4j019gkn4", formatted_address: "Storgata 27, 0184 Oslo, Norway", city: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522 },
      rating: 4.9,
      price: 195,
      currency: "NOK",
      image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
    },
    {
      title: "The Original at Brasserie Pushkin, Moscow",
      slug: "brasserie-pushkin-moscow",
      excerpt: "Where better to review an espresso martini than in the city where vodka flows like water? Brasserie Pushkin delivers old-world charm.",
      content: `# Brasserie Pushkin, Moscow

There's a certain logic to drinking an espresso martini in Moscow. The vodka is going to be excellent — that's a given. The question is whether the rest of the drink can keep up. At Brasserie Pushkin, housed in a stunning 19th-century baroque mansion, the answer is a resounding yes.

## The Drink

They use Russian Standard Platinum as their base, which is clean, smooth, and exactly what you want in this drink. The espresso is pulled from a gleaming Italian machine using a dark Italian roast — none of the light roast trend here.

**It's a classic espresso martini in the truest sense.** Bold, strong, and unapologetically caffeinated. The Kahlúa is measured with precision — enough to add depth and sweetness without masking the coffee. The shaker must get an incredible workout because the foam is dense and persistent.

## The Atmosphere

Brasserie Pushkin is pure theatre. Crystal chandeliers, leather-bound menus, and staff in period costume. It feels like drinking in a tsarist library. The espresso martini arrives on a silver tray, and for a moment, you feel like you deserve this level of service.

## The Verdict

No frills, no twists, no molecular gastronomy — just an exceptionally well-made classic. The quality of the vodka elevates everything, and the attention to detail is evident in every element. If you want to understand what a traditional espresso martini should taste like, this is your benchmark.

**Price:** RUB 890 | **Serving Style:** Frosted coupe glass | **Coffee Bean Garnish:** Three beans in a triangle`,
      bar_name: "Brasserie Pushkin",
      location: "Moscow, Russia",
      location_data: { place_id: "ChIJh2E2GKNKtUYRSQLOwBhMAAQ", formatted_address: "Tverskoy Blvd, 26А, Moscow, Russia, 125009", city: "Moscow", country: "Russia", lat: 55.7648, lng: 37.6043 },
      rating: 4.4,
      price: 890,
      currency: "RUB",
      image_url: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80",
    },
  ];

  for (const post of posts) {
    await sql`
      INSERT INTO posts (title, slug, excerpt, content, bar_name, location, location_data, rating, price, currency, image_url, published, author_id)
      VALUES (${post.title}, ${post.slug}, ${post.excerpt}, ${post.content}, ${post.bar_name}, ${post.location}, ${JSON.stringify(post.location_data)}::jsonb, ${post.rating}, ${post.price}, ${post.currency}, ${post.image_url}, true, 1)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        bar_name = EXCLUDED.bar_name,
        location = EXCLUDED.location,
        location_data = EXCLUDED.location_data,
        rating = EXCLUDED.rating,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
    `;
  }

  console.log(`Seeded ${posts.length} posts.`);
}

async function main() {
  console.log("Seeding database...");
  await createTables();
  await seedAdmin();
  await seedPosts();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
