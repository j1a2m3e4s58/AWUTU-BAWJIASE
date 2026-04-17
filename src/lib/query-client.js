import { QueryClient } from '@tanstack/react-query';

const PUBLIC_QUERY_CACHE_KEY = 'awutu-public-query-cache-v1';
const PUBLIC_QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
const PUBLIC_QUERY_PREFIXES = new Set([
	'announcements',
	'announcements-home',
	'documents',
	'documents-home',
	'events',
	'events-home',
	'gallery',
	'gallery-home',
	'kings',
	'lateKing',
	'leaders-home',
	'lineage-kings',
	's-ann',
	's-docs',
	's-events',
	's-gallery',
	's-history',
	's-kings',
	's-videos',
	'training-videos',
	'videos-home',
]);

const isBrowser = typeof window !== 'undefined';

const isCacheablePublicQuery = (queryKey) => {
	const [prefix] = Array.isArray(queryKey) ? queryKey : [];
	return PUBLIC_QUERY_PREFIXES.has(prefix);
};

const hasUsefulData = (data) => {
	if (Array.isArray(data)) {
		return data.length > 0;
	}

	return data && typeof data === 'object';
};

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 1000 * 30,
		},
	},
});

if (isBrowser) {
	try {
		const cached = JSON.parse(localStorage.getItem(PUBLIC_QUERY_CACHE_KEY) || '[]');
		const now = Date.now();

		cached.forEach((entry) => {
			if (!entry?.queryKey || !isCacheablePublicQuery(entry.queryKey)) return;
			if (!entry.cachedAt || now - entry.cachedAt > PUBLIC_QUERY_CACHE_MAX_AGE) return;
			if (!hasUsefulData(entry.data)) return;

			queryClientInstance.setQueryData(entry.queryKey, entry.data);
		});
	} catch {
		localStorage.removeItem(PUBLIC_QUERY_CACHE_KEY);
	}

	let saveTimer;
	const savePublicQueryCache = () => {
		window.clearTimeout(saveTimer);
		saveTimer = window.setTimeout(() => {
			const entries = queryClientInstance
				.getQueryCache()
				.getAll()
				.filter((query) => isCacheablePublicQuery(query.queryKey))
				.map((query) => ({
					queryKey: query.queryKey,
					data: query.state.data,
					cachedAt: query.state.dataUpdatedAt || Date.now(),
				}))
				.filter((entry) => hasUsefulData(entry.data));

			try {
				localStorage.setItem(PUBLIC_QUERY_CACHE_KEY, JSON.stringify(entries.slice(0, 40)));
			} catch {
				// If storage is full, keep the app running and let Firebase remain the source of truth.
			}
		}, 800);
	};

	queryClientInstance.getQueryCache().subscribe(savePublicQueryCache);
}
