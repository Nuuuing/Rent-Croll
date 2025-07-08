import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api/fetchApi';
import { lotteAreaT, GroupedArea } from '@/types/lotte';

interface UseLotteAreasResult {
    areas: lotteAreaT[] | null;
    loadingAreas: boolean;
    errorAreas: string | null;
}

let cachedAreas: lotteAreaT[] | null = null;
let cachedError: string | null = null;
let cachedLoading = false;
let cachedPromise: Promise<void> | null = null;

export const useLotteAreas = (): UseLotteAreasResult & { allAreas: lotteAreaT[] | null } => {
    const [allAreas, setAllAreas] = useState<lotteAreaT[] | null>(cachedAreas);
    const [loadingAreas, setLoadingAreas] = useState(cachedAreas === null);
    const [errorAreas, setErrorAreas] = useState<string | null>(cachedError);

    useEffect(() => {
        if (cachedAreas !== null || cachedLoading) return;
        cachedLoading = true;
        if (!cachedPromise) {
            cachedPromise = (async () => {
                try {
                    console.log('[useLotteAreas] fetch /api/lotte/area');
                    const res = await fetchApi<GroupedArea>('/api/lotte/area');
                    const allItems = [
                        ...(res['400'] || []),
                        ...(res['500'] || []),
                        ...(res['600'] || []),
                        ...(res['기타'] || [])
                    ];
                    cachedAreas = allItems;
                    cachedError = null;
                } catch (e) {
                    console.error('지점 데이터 로드 중 오류 발생:', e);
                    cachedAreas = null;
                    cachedError = '지점 데이터를 불러오는 데 실패했습니다.';
                } finally {
                    cachedLoading = false;
                }
            })();
        }
        cachedPromise.then(() => {
            setAllAreas(cachedAreas);
            setErrorAreas(cachedError);
            setLoadingAreas(false);
        });
    }, []);

    // areas: 400번대만 필터 (왕복용)
    const areas = allAreas ? allAreas.filter(item => {
        const code = Number(item.code);
        return code >= 400 && code < 500;
    }) : null;

    return { areas, loadingAreas, errorAreas, allAreas };
};