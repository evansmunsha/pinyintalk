import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Welingo</h1>
          <p className="text-6xl font-bold text-teal-700 mb-8">你好</p>
          <p className="text-xl text-gray-600 mb-2">nǐ hǎo</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">
            Talk first.<br />Read along.
          </h2>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            A Mandarin-speaking friend who switches to English the moment you're lost.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Link
            href="/signup"
            className="block w-full max-w-md mx-auto py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Start talking
          </Link>

          <Link
            href="/signin"
            className="block w-full max-w-md mx-auto py-4 px-6 border-2 border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}
