import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <Link href="/account-dashboard">Account</Link>
        ) : (
          <Link href="/auth/signin">Login</Link>
        )}
      </div>
    </header>
  );
};

export default Header; 