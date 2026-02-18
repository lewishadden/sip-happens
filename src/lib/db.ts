import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "sip-happens.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      author_id INTEGER REFERENCES users(id)
    );
  `);

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "espresso123", 12);
    db.prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)").run(
      process.env.ADMIN_EMAIL || "admin@siphappens.com",
      hash,
      "Sip Happens Admin"
    );
  }

  const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
  if (postCount.count === 0) {
    seedPosts(db);
  }
}

function seedPosts(db: Database.Database) {
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
      rating: 4.4,
      price: 890,
      currency: "RUB",
      image_url: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80",
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO posts (title, slug, excerpt, content, bar_name, location, rating, price, currency, image_url, published, author_id)
    VALUES (@title, @slug, @excerpt, @content, @bar_name, @location, @rating, @price, @currency, @image_url, 1, 1)
  `);

  for (const post of posts) {
    stmt.run(post);
  }
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  bar_name: string | null;
  location: string | null;
  rating: number | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  published: number;
  created_at: string;
  updated_at: string;
  author_id: number;
}

export function getUserByEmail(email: string): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function getAllPosts(publishedOnly = true): Post[] {
  if (publishedOnly) {
    return getDb().prepare("SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC").all() as Post[];
  }
  return getDb().prepare("SELECT * FROM posts ORDER BY created_at DESC").all() as Post[];
}

export function getPostBySlug(slug: string): Post | undefined {
  return getDb().prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as Post | undefined;
}

export function getPostById(id: number): Post | undefined {
  return getDb().prepare("SELECT * FROM posts WHERE id = ?").get(id) as Post | undefined;
}

export function createPost(post: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  bar_name: string;
  location: string;
  rating: number;
  price: number | null;
  currency: string;
  image_url: string;
  published: number;
  author_id: number;
}): Post {
  const result = getDb().prepare(`
    INSERT INTO posts (title, slug, excerpt, content, bar_name, location, rating, price, currency, image_url, published, author_id)
    VALUES (@title, @slug, @excerpt, @content, @bar_name, @location, @rating, @price, @currency, @image_url, @published, @author_id)
  `).run(post);
  return getPostById(result.lastInsertRowid as number)!;
}

export function updatePost(
  id: number,
  post: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    bar_name: string;
    location: string;
    rating: number;
    price: number | null;
    currency: string;
    image_url: string;
    published: number;
  }
): Post | undefined {
  getDb().prepare(`
    UPDATE posts SET title=@title, slug=@slug, excerpt=@excerpt, content=@content,
    bar_name=@bar_name, location=@location, rating=@rating, price=@price, currency=@currency,
    image_url=@image_url, published=@published, updated_at=CURRENT_TIMESTAMP WHERE id=@id
  `).run({ ...post, id });
  return getPostById(id);
}

export function deletePost(id: number): void {
  getDb().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

export function getRecentPosts(limit: number = 3): Post[] {
  return getDb()
    .prepare("SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Post[];
}
