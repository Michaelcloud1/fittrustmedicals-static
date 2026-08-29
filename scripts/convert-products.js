const fs = require("fs");
const path = require("path");
const https = require("https");

// --------------------------------------------------
// PATHS
// --------------------------------------------------

const ROOT = process.cwd();

const INPUT_FILE = path.join(
  ROOT,
  "src",
  "data",
  "products.json"
);

const OUTPUT_FILE = path.join(
  ROOT,
  "src",
  "data",
  "products.ts"
);

const IMAGE_DIR = path.join(
  ROOT,
  "public",
  "images",
  "products"
);

// --------------------------------------------------
// CREATE IMAGE DIRECTORY
// --------------------------------------------------

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// --------------------------------------------------
// READ PRODUCTS
// --------------------------------------------------

if (!fs.existsSync(INPUT_FILE)) {
  console.error(`❌ Cannot find: ${INPUT_FILE}`);
  process.exit(1);
}

const products = JSON.parse(
  fs.readFileSync(INPUT_FILE, "utf8")
);

console.log(`\nFound ${products.length} products.\n`);

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function cleanText(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
}

function cleanCategory(category) {
  if (!category) {
    return "Uncategorized";
  }

  return category
    .trim()
    .replace(/\s+/g, " ");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  // Handles:
  // [https://example.com/image.jpg](https://example.com/image.jpg)
  const markdownMatch = value.match(
    /\]\((https?:\/\/[^)]+)\)/
  );

  if (markdownMatch) {
    return markdownMatch[1];
  }

  // Handles plain URLs
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return null;
}

function getExtension(url) {
  try {
    const pathname = new URL(url).pathname;

    const extension = path.extname(pathname).toLowerCase();

    if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) {
      return extension;
    }

    return ".jpg";
  } catch {
    return ".jpg";
  }
}

function escapeTsString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

// --------------------------------------------------
// DOWNLOAD IMAGE
// --------------------------------------------------

function downloadImage(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "FitTrust-Medicals-Static-Site/1.0",
        },
      },
      (response) => {
        // Redirect
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();

          if (fs.existsSync(destination)) {
            fs.unlinkSync(destination);
          }

          return downloadImage(
            response.headers.location,
            destination
          )
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();

          if (fs.existsSync(destination)) {
            fs.unlinkSync(destination);
          }

          reject(
            new Error(
              `HTTP ${response.statusCode}`
            )
          );

          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve();
        });
      }
    );

    request.on("error", (error) => {
      file.close();

      if (fs.existsSync(destination)) {
        fs.unlinkSync(destination);
      }

      reject(error);
    });

    file.on("error", (error) => {
      file.close();

      if (fs.existsSync(destination)) {
        fs.unlinkSync(destination);
      }

      reject(error);
    });
  });
}

// --------------------------------------------------
// GENERATE TYPESCRIPT
// --------------------------------------------------

function createTypeScript(products) {
  let output = `export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description?: string;
  image: string;
  stock?: number;
  featured?: boolean;
  isPromotional?: boolean;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
}

export const products: Product[] = [
`;

  for (const product of products) {
    const description =
      product.description
        ? cleanText(product.description)
        : "";

    output += `  {
    id: ${JSON.stringify(String(product.id))},
    name: ${JSON.stringify(
      cleanText(product.name)
    )},
    price: ${Number(product.price) || 0},
`;

    if (
      product.originalPrice !== undefined &&
      product.originalPrice !== null
    ) {
      output += `    originalPrice: ${Number(
        product.originalPrice
      ) || 0},
`;
    }

    output += `    category: ${JSON.stringify(
      cleanCategory(product.category)
    )},
`;

    if (description) {
      output += `    description: \`${escapeTsString(
        description
      )}\`,
`;
    }

    output += `    image: ${JSON.stringify(
      product.localImage
    )},
`;

    if (product.stock !== undefined) {
      output += `    stock: ${Number(product.stock) || 0},
`;
    }

    output += `    featured: ${Boolean(
      product.featured
    )},
`;

    output += `    isPromotional: ${Boolean(
      product.isPromotional
    )},
`;

    if (
      product.discountPercentage !== undefined &&
      product.discountPercentage !== null
    ) {
      output += `    discountPercentage: ${Number(
        product.discountPercentage
      ) || 0},
`;
    }

    if (
      product.rating !== undefined &&
      product.rating !== null
    ) {
      output += `    rating: ${Number(
        product.rating
      ) || 0},
`;
    }

  if (
  product.reviewCount !== undefined &&
  product.reviewCount !== null
) {
  output += `    reviewCount: ${
    Number(product.reviewCount) || 0
  },
`;
}

    output += `  },

`;
  }

  output += `];
`;

  return output;
}

// --------------------------------------------------
// MAIN
// --------------------------------------------------

async function main() {
  const processedProducts = [];

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    console.log(
      `[${i + 1}/${products.length}] ${product.name}`
    );

    const imageUrl =
      extractUrl(product.image);

    let localImage = "";

    if (imageUrl) {
      const extension =
        getExtension(imageUrl);

      const baseName =
        slugify(product.name) ||
        `product-${i + 1}`;

      let fileName =
        `${baseName}${extension}`;

      let destination =
        path.join(
          IMAGE_DIR,
          fileName
        );

      // Prevent duplicate filenames
      if (fs.existsSync(destination)) {
        fileName =
          `${baseName}-${String(
            product.id
          ).replace(/[^a-zA-Z0-9-]/g, "")}${extension}`;

        destination =
          path.join(
            IMAGE_DIR,
            fileName
          );
      }

      try {
        if (fs.existsSync(destination)) {
          console.log(
            `  ✓ Image already exists: ${fileName}`
          );
          skipped++;
        } else {
          console.log(
            `  ↓ Downloading image...`
          );

          await downloadImage(
            imageUrl,
            destination
          );

          console.log(
            `  ✓ Saved: ${fileName}`
          );

          downloaded++;
        }

        localImage =
          `/images/products/${fileName}`;
      } catch (error) {
        console.error(
          `  ❌ Image failed: ${error.message}`
        );

        failed++;

        // Keep original URL if download fails
        localImage = imageUrl;
      }
    } else {
      console.log(
        `  ⚠ No valid image URL found`
      );

      failed++;
    }

    processedProducts.push({
      ...product,
      name: cleanText(product.name),
      category: cleanCategory(product.category),
      localImage,
    });
  }

  // --------------------------------------------------
  // WRITE PRODUCTS.TS
  // --------------------------------------------------

  const tsContent =
    createTypeScript(processedProducts);

  fs.writeFileSync(
    OUTPUT_FILE,
    tsContent,
    "utf8"
  );

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  console.log("\n====================================");
  console.log("        CONVERSION COMPLETE");
  console.log("====================================\n");

  console.log(
    `Products processed: ${products.length}`
  );

  console.log(
    `Images downloaded:  ${downloaded}`
  );

  console.log(
    `Images skipped:     ${skipped}`
  );

  console.log(
    `Images failed:      ${failed}`
  );

  console.log("\nGenerated:");

  console.log(
    `  ${OUTPUT_FILE}`
  );

  console.log("\nImages:");

  console.log(
    `  ${IMAGE_DIR}`
  );

  console.log("\nDone.\n");
}

main().catch((error) => {
  console.error(
    "\n❌ Conversion failed:"
  );

  console.error(error);

  process.exit(1);
});