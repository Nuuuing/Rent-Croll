import { AreaCarData } from '@/types/lotte';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const requestBody = await request.json();

        let targetAreas: AreaCarData[] = [];
        let puDateFormatted: string;
        let puTimeFormatted: string;
        let retDateFormatted: string;
        let retTimeFormatted: string;

        if (requestBody.areas && Array.isArray(requestBody.areas)) {
            targetAreas = requestBody.areas;
            puDateFormatted = requestBody.puDateFormatted;
            puTimeFormatted = requestBody.puTimeFormatted;
            retDateFormatted = requestBody.retDateFormatted;
            retTimeFormatted = requestBody.retTimeFormatted;
        }

        else if (requestBody.branchCd && requestBody.splace && requestBody.eplace && requestBody.rentDate && requestBody.rentTime && requestBody.returnDate && requestBody.returnTime) {
            targetAreas = [{
                areaCode: requestBody.branchCd,
                placeCode: requestBody.splace,
                areaName: requestBody.branchName || '선택 지점',
                returnAreaCode: requestBody.returnBranchCd,
                returnAreaName: requestBody.returnBranchName || '반납 지점',
                returnPlaceCode: requestBody.eplace
            }];
            puDateFormatted = requestBody.rentDate;
            puTimeFormatted = requestBody.rentTime;
            retDateFormatted = requestBody.returnDate;
            retTimeFormatted = requestBody.returnTime;
        } else {
            return NextResponse.json({ error: '지점 정보 또는 필수 검색 파라미터가 올바르지 않습니다.' }, { status: 400 });
        }


        const fetchPromises = targetAreas.map(async (area: AreaCarData) => {
            try {
                const lotteFormData = new FormData();

                // 편도와 왕복 공통 파라미터
                lotteFormData.append('rentBranch', area.areaCode); // 픽업 지점 코드
                lotteFormData.append('rentDate', puDateFormatted); // 픽업 날짜
                lotteFormData.append('rentTime', puTimeFormatted); // 픽업 시간
                lotteFormData.append('splace', area.placeCode); // 픽업 장소 코드 
                lotteFormData.append('returnDate', retDateFormatted); // 반납 날짜
                lotteFormData.append('returnTime', retTimeFormatted); // 반납 시간 

                lotteFormData.append('eplace', area.returnPlaceCode || area.placeCode);

                lotteFormData.append('returnBranchCd', area.returnAreaCode || area.areaCode);

                // 고정 파라미터
                lotteFormData.append('mvgr2_h', "21");
                lotteFormData.append('pikcupflag', "2");
                lotteFormData.append('cancel', "false");
                lotteFormData.append('gplcnt', "");
                lotteFormData.append('zmytgr', "");

                lotteFormData.append('langCd', 'KOR');
                lotteFormData.append('siteCd', 'HP');


                const lotteApiRes = await fetch('https://www.lotterentacar.net/hp/kor/reservation/car-list.json', {
                    method: 'POST',
                    body: lotteFormData,
                });

                if (!lotteApiRes.ok) {
                    const errorText = await lotteApiRes.text();
                    console.error(`롯데 API 응답 오류 (지점 ${area.areaName || area.areaCode}):`, lotteApiRes.status, errorText);
                    return {
                        areaCode: area.areaCode,
                        areaName: area.areaName || 'Unknown Area',
                        placeCode: area.placeCode,
                        returnAreaCode: area.returnAreaCode, // 편도 반납 지점 정보 (있으면)
                        returnAreaName: area.returnAreaName || 'Unknown Area',
                        returnPlaceCode: area.returnPlaceCode,
                        cars: [],
                        error: `외부 API 오류: ${lotteApiRes.status}`
                    };
                }

                const cars = await lotteApiRes.json();
                return {
                    areaCode: area.areaCode,
                    areaName: area.areaName || 'Unknown Area',
                    placeCode: area.placeCode,
                    returnAreaCode: area.returnAreaCode,
                    returnAreaName: area.returnAreaName || 'Unknown Area',
                    returnPlaceCode: area.returnPlaceCode,
                    cars: cars || []
                };

            } catch (e) {
                console.error(`프록시 내부에서 지점 ${area.areaName || area.areaCode} 차량 정보 로드 실패:`, e);
                return {
                    areaCode: area.areaCode,
                    areaName: area.areaName || 'Unknown Area',
                    placeCode: area.placeCode,
                    returnAreaCode: area.returnAreaCode,
                    returnAreaName: area.returnAreaName || 'Unknown Area',
                    returnPlaceCode: area.returnPlaceCode,
                    cars: [],
                    error: `서버 처리 오류: ${(e instanceof Error) ? e.message : String(e)}`
                };
            }
        });

        const allAreaCarData = await Promise.all(fetchPromises);

        return NextResponse.json(allAreaCarData);

    } catch (error) {
        console.error('API 라우트 처리 중 오류:', error);
        return NextResponse.json(
            { error: '서버 내부 오류 발생', details: (error instanceof Error) ? error.message : String(error) },
            { status: 500 }
        );
    }
}