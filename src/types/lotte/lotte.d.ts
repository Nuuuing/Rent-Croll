// src/types/lotte.d.ts (또는 lotte.ts)

export interface lotteAreaT {
    code: string;
    placeCode: string;
    placeGubun: string;
    name: string;
    onewayReturn: string;
    unmanned: string;
    grpgu: string;
    lat: number;
    lng: number;
}

export type Area = lotteAreaT; // lotteAreaT의 별칭으로 Area를 export

export interface carDataT {
    code: string;
    size: string;
    name: string;
    image: string;
    fuelType: string;
    seats: number;
    price: number;
    dcType: string;
    dcRate: number;
    dcPrice: number;
    avail: number;
    minDcCharge: number;
    minDcRate: number;
    oneWayFee: number;
    dcList: dcListT[];
    mysteryChk: string;
    mysteryCode: string;
    dcCharge: number;
    realBranch: string;
    minCdwCharge: number;
    maxCdwCharge: number;
    useYn: string;
    mdlcd: string;
    zmytgr: string;
    kbetrC: number;
    zscarrier: number;
    zbcarrier: number;
    ltext: string;
    mdly: string;
}

export interface dcListT {
    rateCd: string;
    dcRate: number;
    dcGubun: string;
    kschl: string;
    krech: string;
    kbewr: string;
    konwa: string;
    name: string;
    kschlTx: string;
    waers: string;
    incdw: string;
    matnr: string;
    maktx: string;
    hmopyn: string;
}

// AreaCarData 인터페이스 수정 및 return 관련 필드 추가
export interface AreaCarData {
    areaCode: string;
    placeCode: string;
    areaName: string;
    cars: carDataT[]; // 이 부분을 carDataT[]로 변경해야 합니다.
    error?: string;
    // 편도 관련 필드 추가
    returnAreaCode?: string;
    returnAreaName?: string; // 이 속성이 누락되었던 것입니다.
    returnPlaceCode?: string; // 이 속성이 누락되었던 것입니다.
};

export type GroupedArea = {
    '400': lotteAreaT[];
    '500': lotteAreaT[];
    '600': lotteAreaT[];
    '기타': lotteAreaT[];
};