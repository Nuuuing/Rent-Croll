'use client';

import { fetchApi } from "@/lib/api/fetchApi";
import { carDataT, AreaCarData, lotteAreaT, FlattenedCarData } from "@/types/lotte";
import { useEffect, useState, useMemo } from "react";
import { CarList } from "./CarList";

interface RoundSearchContainerProps {
    areas: lotteAreaT[];
    loadingAreas: boolean;
    errorAreas: string | null;
}

export const RoundSearchContainer = ({ areas }: RoundSearchContainerProps) => {
    const [searchState, setSearchState] = useState<string | null>(null);

    // 날짜/시간 입력
    const [puDateInput, setPuDateInput] = useState<string>('');
    const [puTimeInput, setPuTimeInput] = useState<string>('');
    const [retDateInput, setRetDateInput] = useState<string>('');
    const [retTimeInput, setRetTimeInput] = useState<string>('');

    // 차량 데이터
    const [rawAllAreaCars, setRawAllAreaCars] = useState<AreaCarData[] | null>(null);
    // 차량 검색 진행 상태;
    const [fetchingState, setFetchingState] = useState(false)
    // 최소 탑승 인원 입력
    const [minSeatsInput, setMinSeatsInput] = useState<string>('');

    useEffect(() => {
        // 초기 날짜/시간 설정
        setPuDateInput(`20250913`);
        setRetDateInput(`20250915`);
        setPuTimeInput(`1000`);
        setRetTimeInput(`1600`);
        setMinSeatsInput(`10`);
    }, []);

    const handlePuDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setPuDateInput(e.target.value);
    const handlePuTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setPuTimeInput(e.target.value);
    const handleRetDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setRetDateInput(e.target.value);
    const handleRetTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setRetTimeInput(e.target.value);

    const handleMinSeatsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setMinSeatsInput(value);
        }
    };

    const handleSearch = async () => {
        if (areas.length === 0) {
            setSearchState('지점 데이터가 없어 차량을 검색할 수 없습니다. 상위 컴포넌트의 오류를 확인해주세요.');
            return;
        }
        if (!puDateInput || !puTimeInput || !retDateInput || !retTimeInput) {
            alert('날짜와 시간을 모두 입력해주세요.');
            return;
        }
        if (puDateInput.length !== 8 || puTimeInput.length !== 4 || retDateInput.length !== 8 || retTimeInput.length !== 4) {
            alert('날짜는 WaybackMMDD, 시간은 HHMM00 형식으로 정확히 입력해주세요.');
            return;
        }

        setFetchingState(true);
        setSearchState(null);
        setRawAllAreaCars(null);

        //초(00) 추가
        const puTimeString = puTimeInput+'00';
        const retTimeString = retTimeInput+'00';
        const requestBody = {
            areas: areas,
            puDateInput,
            puTimeString,
            retDateInput,
            retTimeString
        };

        try {
            const allRes: AreaCarData[] = await fetchApi(
                '/api/lotte/car-search',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            setRawAllAreaCars(allRes);
        } catch (e) {
            console.error('차량 검색 API 호출 오류:', e);
            setSearchState('차량 검색 중 오류가 발생했습니다.');
        } finally {
            setFetchingState(false);
        }
    };

    const handleClearAndSearchAgain = () => {
        setRawAllAreaCars(null);
        setSearchState(null);
        setMinSeatsInput('');
        handleSearch();
    };

    const getFinalDisplayPrice = (car: carDataT): number => { // carDataT 타입 사용
        if (typeof car.dcPrice === 'number' && car.dcPrice !== null && car.dcPrice > 0) {
            return car.dcPrice;
        }
        return car.price || 0;
    };

    const processedAllCars = useMemo(() => {
        if (!rawAllAreaCars) {
            return [];
        }

        const minSeats = parseInt(minSeatsInput, 10);

        let allCars: FlattenedCarData[] = [];
        rawAllAreaCars.forEach(areaInfo => {
            if (areaInfo.cars && !areaInfo.error) {
                areaInfo.cars.forEach(car => {
                    allCars.push({
                        ...car,
                        areaCode: areaInfo.areaCode,
                        areaName: areaInfo.areaName,
                        placeCode: areaInfo.placeCode
                    });
                });
            }
        });

        if (!isNaN(minSeats) && minSeats > 0) {
            allCars = allCars.filter(car => car.seats && car.seats >= minSeats);
        }

        allCars.sort((a, b) => {
            const rateA = (typeof a.dcRate === 'number' && a.dcRate !== null) ? a.dcRate : 0;
            const rateB = (typeof b.dcRate === 'number' && b.dcRate !== null) ? b.dcRate : 0;

            if (rateB !== rateA) {
                return rateB - rateA;
            }

            const finalPriceA = getFinalDisplayPrice(a);
            const finalPriceB = getFinalDisplayPrice(b);

            return finalPriceA - finalPriceB;
        });

        return allCars;
    }, [rawAllAreaCars, minSeatsInput]);

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row gap-8 p-8 items-stretch">
            <div className="md:w-2/5 w-full flex flex-col gap-8 h-full">
                <div className="rounded-2xl bg-[#282a45] shadow-xl p-8 flex flex-col gap-6 border border-[#35365a]">
                    <h1 className="text-3xl font-extrabold text-center text-blue-400 mb-2 tracking-tight">왕복 예약</h1>
                    {/* 날짜/시간 카드 */}
                    <div className="rounded-xl bg-[#31335a] p-6 flex flex-col gap-4 shadow-md border border-[#3a3b5c]">
                        <h3 className="text-lg font-bold text-blue-300 mb-1 flex items-center gap-2">날짜/시간</h3>
                        <div className="flex gap-4 mt-2">
                            <div className="flex-1">
                                <label className="block mb-1 text-gray-400">픽업 날짜</label>
                                <input type="text" value={puDateInput} onChange={handlePuDateInputChange}
                                    placeholder="예: 20250708" className="bg-[#23243a] text-gray-200 p-3 border border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm" />
                            </div>
                            <div className="flex-1">
                                <label className="block mb-1 text-gray-400">픽업 시간</label>
                                <input type="text" value={puTimeInput} onChange={handlePuTimeInputChange}
                                    placeholder="예: 100000 (오전 10시)" className="bg-[#23243a] text-gray-200 p-3 border border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm" />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <div className="flex-1">
                                <label className="block mb-1 text-gray-400">반납 날짜</label>
                                <input type="text" value={retDateInput} onChange={handleRetDateInputChange}
                                    placeholder="예: 20250708" className="bg-[#23243a] text-gray-200 p-3 border border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm" />
                            </div>
                            <div className="flex-1">
                                <label className="block mb-1 text-gray-400">반납 시간</label>
                                <input type="text" value={retTimeInput} onChange={handleRetTimeInputChange}
                                    placeholder="예: 100000 (오전 10시)" className="bg-[#23243a] text-gray-200 p-3 border border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm" />
                            </div>
                        </div>
                    </div>
                    {/* 필터 카드 */}
                    <div className="rounded-xl bg-[#2d2e4a] p-6 flex flex-col gap-3 shadow border border-[#3a3b5c]">
                        <h3 className="text-lg font-semibold text-pink-300 mb-2 flex items-center gap-2">인원 필터</h3>
                        <label className="mb-1 text-gray-400">최소 탑승 인원 (숫자):</label>
                        <input type="text" value={minSeatsInput} onChange={handleMinSeatsInputChange}
                            placeholder="예: 10 (10인승 이상)" className="bg-[#23243a] text-gray-200 p-3 border border-pink-400 rounded-lg w-full focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 shadow-sm" />
                    </div>
                    {/* 버튼 카드 */}
                    <div className="flex flex-col gap-3 mt-2">
                        <button onClick={handleSearch} disabled={fetchingState}
                            className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl w-full font-extrabold text-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 ${fetchingState ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {fetchingState ? `검색 중...` : '차량 검색'}
                        </button>
                        <button onClick={handleClearAndSearchAgain} disabled={fetchingState}
                            className={`bg-gradient-to-r from-gray-600 to-gray-800 text-white p-4 rounded-xl w-full font-bold text-lg shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-200 ${fetchingState ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            다시 찾기
                        </button>
                    </div>
                </div>
            </div>
            <CarList
                fetchingState={fetchingState}
                searchState={searchState}
                processedCars={processedAllCars}
                rawAllAreaCars={rawAllAreaCars}
            />
        </div>
    );
};