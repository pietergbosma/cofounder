import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SupabaseConfigWarning: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-yellow-100 p-4 rounded-full">
              <AlertCircle size={48} className="text-yellow-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Database Configuration Required
            </h1>
            <p className="text-lg text-gray-600">
              This application requires Supabase database configuration to function properly.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">Required Environment Variables:</h2>
            <ul className="space-y-2 text-sm font-mono text-gray-700">
              <li>• VITE_SUPABASE_URL=your-project-url</li>
              <li>• VITE_SUPABASE_ANON_KEY=your-anon-key</li>
            </ul>
          </div>

          <div className="text-left space-y-3">
            <h2 className="font-semibold text-gray-900">Setup Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Create a Supabase project at supabase.com</li>
              <li>Copy your project URL and anon key from project settings</li>
              <li>Add these variables to your deployment environment:
                <ul className="ml-6 mt-2 space-y-1">
                  <li>- Vercel: Project Settings → Environment Variables</li>
                  <li>- Other platforms: Add to your .env file or deployment config</li>
                </ul>
              </li>
              <li>Apply the database schema from docs/complete-database-schema.sql</li>
              <li>Redeploy the application</li>
            </ol>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => window.location.href = 'https://supabase.com'}
              className="mr-2"
            >
              Go to Supabase
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            For more information, check the SUPABASE_INTEGRATION_COMPLETE.md file in the project.
          </p>
        </div>
      </Card>
    </div>
  );
};
