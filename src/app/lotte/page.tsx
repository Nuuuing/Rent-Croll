'use client';

import { OneWaySearchContainer, RoundSearchContainer } from '@/components';
import { useLotteAreas } from '@/hooks/useLotteAreas';
import { useState } from 'react';

type ServiceType = 'roundTrip' | 'oneWay';

export default function LottePage() {
    const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('roundTrip');
    const { areas, allAreas, loadingAreas, errorAreas } = useLotteAreas();
    const safeAreas = selectedServiceType === 'roundTrip' ? (areas ?? []) : (allAreas ?? []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#23243a] to-[#2e2f4d] p-8">
            <div className="w-full max-w-7xl">
                <button
                    onClick={() => window.history.back()}
                    className="mb-8 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#23243a] border border-[#35365a] text-blue-200 hover:bg-blue-500 hover:text-white font-bold text-lg shadow transition-all duration-200 cursor-pointer"
                >
                    뒤로가기
                </button>
                {loadingAreas ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                        <div className="text-lg text-blue-400 font-semibold">지점 정보를 불러오는 중입니다...</div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center mb-10 gap-8">
                            <button
                                onClick={() => setSelectedServiceType('roundTrip')}
                                className={`flex flex-col items-center gap-2 px-8 py-6 rounded-2xl font-extrabold text-2xl shadow-xl transition-all duration-300 border-2 ${selectedServiceType === 'roundTrip' ? 'bg-blue-500 border-blue-400 text-white scale-105' : 'bg-[#282a45] border-[#35365a] text-blue-200 hover:bg-blue-400 hover:text-white hover:scale-105'} cursor-pointer`}
                            >
                                왕복 렌터카
                            </button>
                            <button
                                onClick={() => setSelectedServiceType('oneWay')}
                                className={`flex flex-col items-center gap-2 px-8 py-6 rounded-2xl font-extrabold text-2xl shadow-xl transition-all duration-300 border-2 ${selectedServiceType === 'oneWay' ? 'bg-purple-500 border-purple-400 text-white scale-105' : 'bg-[#282a45] border-[#35365a] text-purple-200 hover:bg-purple-400 hover:text-white hover:scale-105'} cursor-pointer`}
                            >
                                편도 렌터카
                            </button>
                        </div>
                        {selectedServiceType === 'roundTrip' ? (
                            <RoundSearchContainer areas={safeAreas} loadingAreas={loadingAreas} errorAreas={errorAreas} />
                        ) : (
                            <OneWaySearchContainer areas={safeAreas} loadingAreas={loadingAreas} errorAreas={errorAreas} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}