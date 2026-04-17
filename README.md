# MedPal - AI-Powered Health Assistant

A comprehensive health monitoring and AI-powered diagnostic assistant built with React, TypeScript, and Google Gemini AI.

## Features

- 🤖 **AI Health Assistant**: Powered by Google Gemini 1.5 Pro
- 🏥 **Symptom Analysis**: Get potential diagnoses based on symptoms
- 💬 **Intelligent Chat**: Interactive health conversations
- 📊 **Health Monitoring**: Track your health metrics
- 🎯 **Diagnostic Flow**: Step-by-step symptom analysis
- 📱 **Responsive Design**: Works on desktop and mobile
- 🌙 **Dark Mode**: Beautiful dark and light themes

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd MedPal-v1

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Configure Gemini AI

**Important**: You need to configure your Gemini API key before using the AI features.

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open the app and go to Settings
3. Paste your API key and click "Save"
4. Test the connection with the "Test" button

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI**: Google Gemini 1.5 Pro
- **Database**: Supabase (optional)
- **State Management**: React Hooks
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── pages/              # Page components
├── services/           # API services
│   ├── apiService.ts   # Gemini AI integration
│   └── geminiService.ts # Health-specific AI logic
├── hooks/              # Custom React hooks
└── integrations/       # Third-party integrations
```

## Development

```sh
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment

### Via Lovable
1. Open [Lovable](https://lovable.dev/projects/e9c941d1-e838-40b2-adfb-c4236666e316)
2. Click Share → Publish

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider

## Custom Domain

To connect a custom domain:
1. Navigate to Project > Settings > Domains
2. Click "Connect Domain"
3. Follow the DNS configuration instructions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- **Setup Issues**: See [SETUP.md](./SETUP.md)
- **API Key Problems**: Check the browser console for detailed error messages
- **General Issues**: Open an issue on GitHub

## License

This project is licensed under the MIT License.

---

**Note**: This application provides general health information only. Always consult healthcare professionals for medical advice.
