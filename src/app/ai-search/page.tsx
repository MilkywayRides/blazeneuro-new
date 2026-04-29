import AISearch from '@/components/AISearch';

export default function AISearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI-Powered Search</h1>
          <p className="text-gray-600">
            Search with reinforcement learning - the AI learns from your clicks
          </p>
        </div>
        <AISearch />
      </div>
    </div>
  );
}
