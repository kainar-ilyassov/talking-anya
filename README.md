<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Talking Anya - Russian Tutor

An interactive Russian language tutor powered by Google's Gemini AI with voice conversation capabilities.

🚀 **Live Demo:** [https://kainar-ilyassov.github.io/talking-anya/](https://kainar-ilyassov.github.io/talking-anya/)

View your app in AI Studio: https://ai.studio/apps/drive/1zL9nGiNvr-KRgc49Ebmi0tN0UifS2HVv

## Features

- 🎤 Real-time voice conversations
- 🤖 AI-powered Russian language tutoring
- 🎨 Interactive user interface
- 📊 Audio visualization

## Run Locally

**Prerequisites:** Node.js 18+

1. Clone the repository:
   ```bash
   git clone https://github.com/kainar-ilyassov/talking-anya.git
   cd talking-anya
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   Get your API key from [Google AI Studio](https://ai.google.dev/)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to GitHub Pages

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push to GitHub
2. Add `GEMINI_API_KEY` as a repository secret
3. Enable GitHub Pages in repository settings (Source: GitHub Actions)
4. Push to `main` branch to trigger automatic deployment

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages (manual method)

## Tech Stack

- React 19
- TypeScript
- Vite
- Google Gemini AI
- Lucide React Icons

## License

MIT
