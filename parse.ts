import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load the API key from your environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);

async function parseInstagramData() {
  console.log("🌸 Reading Instagram data...");

  try {
    // 1. Read the raw JSON file from Apify
    const filePath = path.join(process.cwd(), 'instagram_data.json');
    const rawContent = await fs.readFile(filePath, 'utf-8');

    // 2. NEW: Parse the JSON and slice it so we don't hit the 250k token limit!
    const parsedJson = JSON.parse(rawContent);
    // Grab only the first 30 posts
    const limitedData = Array.isArray(parsedJson) ? parsedJson.slice(0, 30) : parsedJson; 
    const stringifiedData = JSON.stringify(limitedData);

    console.log(`🧠 Sending ${limitedData.length} posts to Gemini to stay under the token limit...`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Act as a data engineer. I have scraped the Instagram profile for 'Bloom Room Kenya'. Below is a JSON export of their posts.

    I need you to parse this data and generate a TypeScript array of objects to drop into my Prisma seed script.

    Instructions:
    1. Read the caption of each post. Extract the likely Product Name, Price (in KES, output strictly as an integer, no commas), and a short Description. If the price isn't listed, set it to 0.
    2. Assign a categoryId. For now, just use the string "CATEGORY_ID_PLACEHOLDER".
    3. Use the display_url from the JSON for the imageUrl.
    4. Set a default stock of 10 for every item.
    5. Format the output STRICTLY as the inner array for a Prisma createMany call, like this:
       [ { name: "...", description: "...", price: 1000, imageUrl: "...", categoryId: "...", stock: 10 }, ... ]
    6. Return ONLY valid TypeScript/JSON. Do not wrap it in markdown code blocks. No explanations.

    Here is the JSON data:
    ${stringifiedData}
    `;

    // Generate and extract the text
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Write the perfectly formatted array to a new file
    const outputPath = path.join(process.cwd(), 'parsed_seed_data.ts');
    await fs.writeFile(outputPath, response);

    console.log("✅ Done! Check the parsed_seed_data.ts file in your root folder.");

    } catch (error) {
      console.error("❌ Something went wrong:", error);
    }
  }
  
  parseInstagramData();