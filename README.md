# Pet Clinic Directory

A Next.js application for finding and displaying information about pet clinics, built with React and Tailwind CSS. Includes AI-generated descriptions for listings and city pages.

## Features

*   Browse clinics by city.
*   View detailed information for each clinic (address, phone, website, map, description).
*   Search across listings by name, location, etc.
*   Filter listings by rating and number of reviews.
*   Responsive design.
*   AI-generated descriptions for listings (via OpenAI API).
*   AI-generated introductory text for city pages (via OpenAI API).

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **UI Library:** [React](https://reactjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (with JIT mode, Typography, Forms, Aspect Ratio plugins)
*   **Data Parsing:** `csv-parse`
*   **AI Content:** [OpenAI API](https://openai.com/api/) (gpt-4o-mini or similar)
*   **Mapping:** [OpenStreetMap](https://www.openstreetmap.org/) (via iframe embed)
*   **Deployment:** Requires Node.js environment (not static export)

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Environment Variables:**
    *   Create a file named `.env.local` in the project root.
    *   Add your OpenAI API key:
        ```
        OPENAI_API_KEY=your_openai_api_key_here
        ```
    *   *(Note: This key is required for the data processing script to generate descriptions. The site will run without it, but descriptions/city text might be missing or use fallbacks).* 

## Data Processing

The directory listings are sourced from `data/items.csv`. To process this data, generate AI descriptions, and create the `data/processed_data.json` file used by the application, run the parsing script:

```bash
npm run parse-csv
# or directly
# node scripts/parse-csv.js
```

*   This script reads `data/items.csv`.
*   It uses the `OPENAI_API_KEY` (if provided) to generate:
    *   Unique descriptions for each business listing (if one doesn't exist in the JSON).
    *   Unique introductory text for each city page.
*   It calculates `itemCount` for cities.
*   It structures the data and saves it to `data/processed_data.json`.
*   **Run this script whenever `data/items.csv` is updated or if you want to regenerate AI content.**

## Running the Development Server

To start the development server (usually on `http://localhost:3000` or the specified port):

```bash
npm run dev
# or specify a port (e.g., 9000)
# PORT=9000 npm run dev
```

Open [http://localhost:9000](http://localhost:9000) (or your chosen port) in your browser.

## Building for Production

To create an optimized production build:

```bash
npm run build
```

## Running in Production

After building, start the production server:

```bash
npm run start
# or specify a port
# PORT=8080 npm run start
```

**Important:** Since this project uses server-side features (like the Image Optimization API), it requires a Node.js hosting environment. You cannot simply deploy the output of `next export`. Use a platform like Vercel, Netlify (standard deployment), or a custom Node.js server setup (e.g., on Cloudways with a reverse proxy and process manager like `pm2`).

## Linting

To run the linter (ESLint):

```bash
npm run lint
```