import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks } from '../../api/tasks';
import { getCatalog } from '../../api/catalog';
import { syncAll } from '../../api/sync';
import { TaskCard } from '../../components/TaskCard';
import { TaskCatalogCard } from '../../components/TaskCatalogCard';
import { DateRangeSelect } from '../../components/DateRangeSelect';
import { useAuth } from '../../context/AuthContext';
import { dateRangeToParams } from '../../utils/dateRange';

const PAGE_SIZE = 24;
const CATEGORIES = ['all', 'tracking', 'flicking', 'switching', 'clicking', 'other'];

function categoryLabel(cat: string) {
  return cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function Dashboard() {
  const { isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const tab = (searchParams.get('tab') as 'my-tasks' | 'catalog') ?? (isLoggedIn ? 'my-tasks' : 'catalog');
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const orderBy = searchParams.get('order_by') ?? 'recently_played';
  const dateRange = searchParams.get('date_range') ?? 'all';
  const catalogOrderBy = searchParams.get('catalog_order_by') ?? 'recently_played';

  // Local search input (only committed on Enter or filter change)
  const [searchInput, setSearchInput] = useState(search);

  function setParam(key: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value && value !== 'all' && value !== 'recently_played') next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  }

  function setTabParam(value: 'my-tasks' | 'catalog') {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', value);
      next.delete('search');
      next.delete('category');
      next.delete('date_range');
      return next;
    }, { replace: true });
    setSearchInput('');
  }

  function applySearch() {
    setParam('search', searchInput);
  }

  // My Tasks query
  const { from, to } = dateRangeToParams(dateRange);
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', { search, category, orderBy, from, to }],
    queryFn: () => getTasks({
      name: search || undefined,
      category: category !== 'all' ? category : undefined,
      order_by: orderBy,
      played_from: from,
      played_to: to,
    }),
    enabled: isLoggedIn && tab === 'my-tasks',
  });

  // Catalog infinite query
  const {
    data: catalogData,
    isLoading: loadingCatalog,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['catalog', { search, category, catalogOrderBy }],
    queryFn: ({ pageParam }) => getCatalog({
      name: search || undefined,
      category: category !== 'all' ? category : undefined,
      order_by: catalogOrderBy,
      page: pageParam as number,
      page_size: PAGE_SIZE,
    }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.items.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: tab === 'catalog',
  });

  const catalogItems = catalogData?.pages.flatMap(p => p.items) ?? [];
  const catalogTotal = catalogData?.pages[0]?.total_count ?? 0;

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: syncAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleSync = useCallback(() => syncMutation.mutate(), [syncMutation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero + Tabs */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Tasks</h1>
        <p className="text-white/40 text-sm mb-6">
          {tab === 'my-tasks'
            ? 'Your Aimlabs tasks — set thresholds and track your progress'
            : 'Leaderboard — see who is standing out on tasks'}
        </p>

        {isLoggedIn && (
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
            <button onClick={() => setTabParam('my-tasks')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'my-tasks' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/60'}`}>
              My Tasks
            </button>
            <button onClick={() => setTabParam('catalog')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'catalog' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/60'}`}>
              Leaderboard
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Row 1: Search + Sync */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder="Search task..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20"
            />
          </div>
          {isLoggedIn && tab === 'my-tasks' && (
            <button onClick={handleSync} disabled={syncMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors shrink-0">
              {syncMutation.isPending ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Syncing...</>
              ) : 'Sync Aimlabs'}
            </button>
          )}
        </div>

        {/* Row 2: Category */}
        <div className="flex gap-2">
          <select value={category} onChange={e => setParam('category', e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-white/20 cursor-pointer [&>option]:bg-[#0f0f17] [&>option]:text-white">
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{categoryLabel(cat)}</option>)}
          </select>
        </div>

        {/* Row 3: My-tasks filters */}
        {isLoggedIn && tab === 'my-tasks' && (
          <div className="flex flex-wrap gap-2 items-center">
            <select value={orderBy} onChange={e => setParam('order_by', e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-white/20 cursor-pointer [&>option]:bg-[#0f0f17] [&>option]:text-white">
              <option value="recently_played">Recently Played</option>
              <option value="most_played">Most Played</option>
              <option value="position_in_rank">Position in Rank</option>
            </select>
            <DateRangeSelect value={dateRange} onChange={v => setParam('date_range', v)} />
          </div>
        )}

        {/* Row 3: Catalog order */}
        {tab === 'catalog' && (
          <div className="flex gap-2">
            <select value={catalogOrderBy} onChange={e => setParam('catalog_order_by', e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-white/20 cursor-pointer [&>option]:bg-[#0f0f17] [&>option]:text-white">
              <option value="recently_played">Recently Played</option>
              <option value="most_played">Most Played</option>
            </select>
          </div>
        )}
      </div>

      {/* My Tasks */}
      {tab === 'my-tasks' && (
        <>
          {loadingTasks && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="bg-white/[0.03] rounded-2xl p-5 h-48 animate-pulse border border-white/5" />)}
            </div>
          )}
          {!loadingTasks && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/>
                  <line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/>
                  <line x1="12" y1="22" x2="12" y2="18"/>
                </svg>
              </div>
              <h3 className="text-white/50 font-medium mb-1">No tasks yet</h3>
              <p className="text-white/20 text-sm mb-6">
                Link your Aimlabs account in Profile, then hit Sync Aimlabs to import your tasks.
              </p>
              <button onClick={handleSync} disabled={syncMutation.isPending}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-medium">
                Sync Aimlabs
              </button>
            </div>
          )}
          {!loadingTasks && tasks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(task => <TaskCard key={task.aimlabs_task_id} task={task} />)}
            </div>
          )}
        </>
      )}

      {/* Catalog */}
      {tab === 'catalog' && (
        <>
          {loadingCatalog && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white/[0.03] rounded-2xl p-5 h-44 animate-pulse border border-white/5" />)}
            </div>
          )}
          {!loadingCatalog && catalogItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-white/30 text-sm">No tasks found. Try different filters.</p>
            </div>
          )}
          {!loadingCatalog && catalogItems.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {catalogItems.map(item => <TaskCatalogCard key={item.aimlabs_task_id} task={item} />)}
              </div>
              {hasNextPage && (
                <div className="flex justify-center">
                  <button onClick={() => fetchNextPage()} disabled={loadingMore}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white/60 rounded-xl text-sm font-medium transition-colors">
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                        Loading...
                      </span>
                    ) : `Load More (${catalogTotal - catalogItems.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
