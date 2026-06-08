import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-9xl font-bold text-white tracking-tighter mb-4">404</h1>
      <p className="text-neutral-400 text-lg mb-8">The page you are looking for does not exist.</p>
      <Link to="/" className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
