import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) router.replace('/login');
    }, []);

    return <Component {...props} />;
  };
}
