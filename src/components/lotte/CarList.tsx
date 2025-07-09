'use client';

import { getFinalDisplayPrice } from "@/utils/car";

interface CarListProps {
    fetchingCars: boolean;
    fetchProgress: number;
    searchError: string | null;
    processedCars: any[];
    rawAllAreaCars: any[] | null;
}

export const CarList = (props: CarListProps) => {
    const { fetchingCars, fetchProgress, searchError, processedCars, rawAllAreaCars } = props;

    return (
        <div className="md:w-3/5 w-full flex flex-col gap-8 h-full">
            <div className="rounded-2xl bg-[#282a45] shadow-xl p-8 border border-[#35365a] flex flex-col h-full">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[660px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#44446a] scrollbar-track-[#282a45]">
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
    );
}