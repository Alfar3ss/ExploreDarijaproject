import LoginForm from '../../components/login-form'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Login To Your ExploreDarija Account - ExploreDarija',
  description: 'Log in to your ExploreDarija account to access personalized features, track your progress, and utilize our AI-powered Darija learning tools.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <LoginForm />
    </main>
  )
}
