import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function App() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect('/login');
  return redirect('/dashboard');
}
