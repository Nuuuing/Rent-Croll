import { lotteAreaT } from '@/types/lotte'; 
import { NextResponse } from 'next/server';

const DATA_URL = 'https://www.lotterentacar.net/hp/kor/reservation/branches-land.json';

export async function GET() {
    try {
        const res = await fetch(DATA_URL);
        if (!res.ok) {
            return NextResponse.json({ error: '데이터를 불러오지 못했습니다.' }, { status: res.status });
        }

        const jsonData: lotteAreaT[] = await res.json();

        const grouped: Record<string, lotteAreaT[]> = {
            '400': [],
            '500': [],
            '600': [],
            '기타': [],
        };

        for (const item of jsonData) {
            const prefix = item.code?.substring(0, 1);
            if (prefix === '4') grouped['400'].push(item);
            else if (prefix === '5') grouped['500'].push(item);
            else if (prefix === '6') grouped['600'].push(item);
            else grouped['기타'].push(item);
        }

        return NextResponse.json(grouped);
    } catch (error) {
        console.error("API 라우트 내부 오류:", error); 
        return NextResponse.json({ error: '서버 오류 발생', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}