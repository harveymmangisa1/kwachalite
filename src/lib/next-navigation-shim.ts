import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

type RouterNavigation = {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch?: (path: string) => void;
};

export const useRouter = (): RouterNavigation => {
  const navigate = useNavigate();

  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => undefined,
  };
};

export const usePathname = (): string => {
  const location = useLocation();
  return location.pathname;
};

export const useSearchParamsShim = () => {
  const [params] = useSearchParams();
  return params;
};

export const useParamsShim = <T extends Record<string, string | undefined>>() => {
  return useParams<T>();
};

export const useSearchParams = useSearchParamsShim;
export const useParams = useParamsShim;

