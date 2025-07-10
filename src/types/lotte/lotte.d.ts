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

export interface AreaCarData {
    areaCode: string;
    placeCode: string;
    areaName: string;
    cars?: carDataT[]; 
    error?: string;
    returnAreaCode?: string;
    returnAreaName?: string; 
    returnPlaceCode?: string; 
};

export type GroupedArea = {
    '400': lotteAreaT[];
    '500': lotteAreaT[];
    '600': lotteAreaT[];
    '기타': lotteAreaT[];
};

export type FlattenedCarData = carDataT & {
    areaCode: string;
    areaName: string;
    placeCode: string;    
    returnAreaCode?: string; // 편도 반납 지점 코드
    returnAreaName?: string; // 편도 반납 지점 이름
    returnPlaceCode?: string; // 편도 반납 장소 코드
};