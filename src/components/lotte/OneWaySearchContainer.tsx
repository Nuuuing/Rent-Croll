// src/components/lotte/OneWaySearchContainer.tsx
'use client';

import { fetchApi } from "@/lib/api/fetchApi";
import { Area, carDataT, AreaCarData, lotteAreaT } from "@/types/lotte";
import { useEffect, useState, useMemo } from "react";

type FlattenedCarData = carDataT & {
    areaCode: string;
    areaName: string;
    placeCode: string;
    returnAreaCode?: string; // 편도 반납 지점 코드
    returnAreaName?: string; // 편도 반납 지점 이름
    returnPlaceCode?: string; // 편도 반납 장소 코드
};

interface OneWaySearchContainerProps {
    areas: lotteAreaT[];
    loadingAreas: boolean;
    errorAreas: string | null;
}

export const OneWaySearchContainer = ({ areas, loadingAreas, errorAreas }: OneWaySearchContainerProps) => { // prop으로 areas, loadingAreas, errorAreas 받기
    const [searchError, setSearchError] = useState<string | null>(null);

    // 편도 픽업/반납 지점
    const [pickupLocation, setPickupLocation] = useState<Area | undefined>(undefined);
    const [returnLocation, setReturnLocation] = useState<Area | undefined>(undefined);

    // 날짜 및 시간
    const [puDateInput, setPuDateInput] = useState<string>('');
    const [puTimeInput, setPuTimeInput] = useState<string>('');
    const [retDateInput, setRetDateInput] = useState<string>('');
    const [retTimeInput, setRetTimeInput] = useState<string>('');

    const [rawAllAreaCars, setRawAllAreaCars] = useState<AreaCarData[] | null>(null);
    const [fetchingCars, setFetchingCars] = useState(false);
    const [fetchProgress, setFetchProgress] = useState(0);

    const [minSeatsInput, setMinSeatsInput] = useState<string>('');

    useEffect(() => {
        if (areas && areas.length > 0) {
            setPickupLocation(undefined);
            setReturnLocation(undefined);
        }
    }, [areas]);

    useEffect(() => {
        // 초기 날짜/시간 설정
        setPuDateInput(`20250913`);
        setRetDateInput(`20250915`);
        setPuTimeInput(`100000`);
        setRetTimeInput(`160000`);        
        setMinSeatsInput(`10`);
    }, []);

    const getFormattedDateForApi = (dateInput: string) => dateInput.replace(/-/g, '');
    const getFormattedTimeForApi = (timeInput: string) => {
        const parts = timeInput.split(':');
        let hours = parseInt(parts[0] || '0', 10);
        let minutes = parseInt(parts[1] || '0', 10);
        if (isNaN(hours) || hours < 0 || hours > 23) hours = 0;
        if (isNaN(minutes) || minutes < 0 || minutes > 59) minutes = 0;
        return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
    };

    const handlePickupLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCode = e.target.value;
        setPickupLocation(areas?.find(a => a.code === selectedCode));
    };
    const handleReturnLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCode = e.target.value;
        setReturnLocation(areas?.find(a => a.code === selectedCode));
    };

    const handlePuDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setPuDateInput(e.target.value);
    const handlePuTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setPuTimeInput(e.target.value);
    const handleRetDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setRetDateInput(e.target.value);
    const handleRetTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setRetTimeInput(e.target.value);
    const handleMinSeatsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (/^\d*$/.test(e.target.value)) setMinSeatsInput(e.target.value);
    };

    const handleSearch = async () => {
        const puDateFormatted = getFormattedDateForApi(puDateInput);
        const puTimeFormatted = getFormattedTimeForApi(puTimeInput);
        const retDateFormatted = getFormattedDateForApi(retDateInput);
        const retTimeFormatted = getFormattedTimeForApi(retTimeInput);

        if (!areas || areas.length === 0) {
            setSearchError('지점 데이터를 불러오는 중이거나, 불러올 지점이 없습니다.');
            return;
        }
        if (!pickupLocation || !returnLocation || !puDateInput || !puTimeInput || !retDateInput || !retTimeInput) {
            alert('모든 필수 정보를 입력해주세요 (픽업/반납 지점, 날짜, 시간).');
            return;
        }
        if (puDateFormatted.length !== 8 || puTimeFormatted.length !== 6 || retDateFormatted.length !== 8 || retTimeFormatted.length !== 6) {
            alert('날짜는 WaybackMMDD, 시간은 HHMM00 형식으로 정확히 입력해주세요.');
            return;
        }

        setFetchingCars(true);
        setFetchProgress(0);
        setSearchError(null);
        setRawAllAreaCars(null);

        try {
            const requestBody = {
                branchCd: pickupLocation.code,
                rentDate: puDateFormatted,
                rentTime: puTimeFormatted,
                splace: pickupLocation.placeCode,
                returnDate: retDateFormatted,
                returnTime: retTimeFormatted,
                eplace: returnLocation.placeCode,
                returnBranchCd: returnLocation.code, // 편도 시 반납 지점 코드 추가


                mvgr2_h: "21",
                pikcupflag: "1",
                cancel: "false",
                gplcnt: "",
                zmytgr: ""
            };

            const carRes: carDataT[] = await fetchApi(
                '/api/lotte/car-search',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                }
            );

            setRawAllAreaCars([{
                areaCode: pickupLocation.code,
                areaName: pickupLocation.name,
                placeCode: pickupLocation.placeCode,
                returnAreaCode: returnLocation.code,
                returnAreaName: returnLocation.name,
                returnPlaceCode: returnLocation.placeCode,
                cars: carRes || []
            }]);
            setFetchProgress(100);

        } catch (e) {
            console.error('차량 검색 API 호출 오류:', e);
            setSearchError('차량 검색 중 오류가 발생했습니다.');
            setRawAllAreaCars([]);
        } finally {
            setFetchingCars(false);
        }
    };

    const handleClearAndSearchAgain = () => {
        setRawAllAreaCars(null);
        setSearchError(null);
        setMinSeatsInput('');
        handleSearch();
    };

    const getFinalDisplayPrice = (car: carDataT): number => {
        if (typeof car.dcPrice === 'number' && car.dcPrice !== null && car.dcPrice > 0) {
            return car.dcPrice;
        }
        return car.price || 0;
    };

    const processedCars = useMemo(() => {
        if (!rawAllAreaCars || rawAllAreaCars.length === 0) {
            return [];
        }

        // 모든 위치의 차량을 합쳐서 보여줌 (400번대 필터 없이 전체)
        let cars: FlattenedCarData[] = [];
        rawAllAreaCars.forEach(areaInfo => {
            if (areaInfo.cars && !areaInfo.error) {
                areaInfo.cars.forEach(car => {
                    cars.push({
                        ...car,
                        areaCode: areaInfo.areaCode,
                        areaName: areaInfo.areaName,
                        placeCode: areaInfo.placeCode,
                        returnAreaCode: areaInfo.returnAreaCode,
                        returnAreaName: areaInfo.returnAreaName,
                        returnPlaceCode: areaInfo.returnPlaceCode,
                    });
                });
            }
        });

        const minSeats = parseInt(minSeatsInput, 10);
        if (!isNaN(minSeats) && minSeats > 0) {
            cars = cars.filter(car => car.seats && car.seats >= minSeats);
        }

        cars.sort((a, b) => {
            const rateA = (typeof a.dcRate === 'number' && a.dcRate !== null) ? a.dcRate : 0;
            const rateB = (typeof b.dcRate === 'number' && b.dcRate !== null) ? b.dcRate : 0;
            if (rateB !== rateA) return rateB - rateA;

            const finalPriceA = getFinalDisplayPrice(a);
            const finalPriceB = getFinalDisplayPrice(b);
            return finalPriceA - finalPriceB;
        });

        return cars;
    }, [rawAllAreaCars, minSeatsInput]);

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row gap-8 p-8 items-stretch">
            {/* 왼쪽 카드: 예약 입력 */}
            <div className="md:w-2/5 w-full flex flex-col gap-8 h-full">
                <div className="rounded-2xl bg-[#282a45] shadow-xl p-8 flex flex-col gap-6 border border-[#35365a]">
                    <h1 className="text-3xl font-extrabold text-center text-blue-400 mb-2 tracking-tight">편도 예약</h1>
                    {/* 픽업 카드 */}
                    <div className="rounded-xl bg-[#31335a] p-6 flex flex-col gap-4 shadow-md border border-[#3a3b5c]">
                        <h3 className="text-lg font-bold text-blue-300 mb-1 flex items-center gap-2">픽업</h3>
                        <select
                            value={pickupLocation?.code || ''}
                            onChange={handlePickupLocationChange}
                            className="bg-[#23243a] text-gray-200 p-3 border border-blue-500 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                        >
                            <option value="">지점을 선택하세요</option>
                            {areas && areas.map((item) => (
                                <option key={`${item.code}-${item.placeCode}`} value={item.code}>
                                    {item.name} ({item.code}) [PL:{item.placeCode}]
                                </option>
                            ))}
                        </select>
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
                    </div>
                    {/* 반납 카드 */}
                    <div className="rounded-xl bg-[#31335a] p-6 flex flex-col gap-4 shadow-md border border-[#3a3b5c]">
                        <h3 className="text-lg font-bold text-purple-300 mb-1 flex items-center gap-2">반납</h3>
                        <select
                            value={returnLocation?.code || ''}
                            onChange={handleReturnLocationChange}
                            className="bg-[#23243a] text-gray-200 p-3 border border-purple-500 rounded-lg w-full focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                        >
                            <option value="">지점을 선택하세요</option>
                            {areas && areas.map((item) => (
                                <option key={`${item.code}-${item.placeCode}`} value={item.code}>
                                    {item.name} ({item.code}) [PL:{item.placeCode}]
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-4 mt-2">
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
                        <button onClick={handleSearch} disabled={fetchingCars}
                            className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl w-full font-extrabold text-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 ${fetchingCars ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {fetchingCars ? `검색 중... ${fetchProgress}%` : '차량 검색'}
                        </button>
                        <button onClick={handleClearAndSearchAgain} disabled={fetchingCars}
                            className={`bg-gradient-to-r from-gray-600 to-gray-800 text-white p-4 rounded-xl w-full font-bold text-lg shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-200 ${fetchingCars ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            다시 찾기
                        </button>
                    </div>
                </div>
            </div>
            {/* 오른쪽 카드: 차량 정보 */}
            <div className="md:w-3/5 w-full flex flex-col gap-8 h-full">
                <div className="rounded-2xl bg-[#282a45] shadow-xl p-8 border border-[#35365a] min-h-[1022px] flex flex-col h-full">
                    <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-400 tracking-tight">차량 정보</h2>
                    {fetchingCars && (
                        <div className="flex flex-col items-center justify-center flex-1">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                            <div className="text-lg text-blue-300 font-semibold">차량 정보를 불러오는 중... {fetchProgress}%</div>
                        </div>
                    )}
                    {searchError && (
                        <div className="text-center mt-4 text-red-400 font-semibold">
                            오류: {searchError}
                        </div>
                    )}
                    {!fetchingCars && processedCars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[520px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#44446a] scrollbar-track-[#282a45]">
                            {processedCars.map((car, idx) => (
                                <div key={`${car.areaCode}-${car.placeCode}-${car.code || idx}`} className="rounded-xl bg-[#31335a] p-6 shadow-lg border border-[#3a3b5c] flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-lg text-white">{car.name}</span>
                                    </div>
                                    <div className="text-gray-300 text-sm mb-1">{car.fuelType}, {car.seats}인승</div>
                                    <div className="text-gray-400 text-xs mb-2">픽업: <span className="text-blue-300">{car.areaName} ({car.areaCode})</span> / 반납: <span className="text-purple-300">{car.returnAreaName} ({car.returnAreaCode})</span></div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs">기본 가격</span>
                                        <span className="text-gray-500 line-through">{car.price?.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs">최종 가격</span>
                                        <span className="font-bold text-green-400 text-lg">{getFinalDisplayPrice(car).toLocaleString()}원</span>
                                        {car.dcPrice && car.dcRate ? <span className="ml-2 text-pink-300 font-bold">({car.dcRate}% 할인)</span> : ''}
                                    </div>
                                    {car.avail ? <div className="text-sm text-gray-400 mt-1">잔여: <span className="text-green-300 font-bold">{car.avail}대</span></div> : ''}
                                </div>
                            ))}
                        </div>
                    ) : !fetchingCars && (
                        <div className="flex flex-col items-center justify-center flex-1 text-gray-400 text-lg">
                            날짜, 시간, 픽업/반납 지점을 입력하고 '차량 검색' 버튼을 눌러주세요.
                        </div>
                    )}
                    {!fetchingCars && processedCars.length === 0 && rawAllAreaCars !== null && (
                        <div className="flex flex-col items-center justify-center flex-1 text-gray-400 text-lg">
                            입력된 조건에 맞는 차량이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};