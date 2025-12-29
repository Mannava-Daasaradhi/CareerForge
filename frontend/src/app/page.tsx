import { redirect } from 'next/navigation';

export default function Home() {
  // Force redirect to the "Entropy Login" page
  redirect('/login');
}